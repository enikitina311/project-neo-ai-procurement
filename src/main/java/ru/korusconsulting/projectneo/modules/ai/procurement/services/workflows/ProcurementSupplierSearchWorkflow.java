package ru.korusconsulting.projectneo.modules.ai.procurement.services.workflows;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.extern.slf4j.Slf4j;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.items.ProcurementItemService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.items.dto.response.ProcurementItemDto;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.packages.ProcurementPackageService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.packages.dto.response.ProcurementPackageDto;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.support.ProcurementN8nHelper;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.support.ProcurementN8nHelper.ParsedN8nResponse;

@Service
@Slf4j
public class ProcurementSupplierSearchWorkflow {
    private static final double DEFAULT_COVERAGE_THRESHOLD = 0.7;
    private static final int DEFAULT_SUPPLIERS_LIMIT = 10;

    private final ProcurementItemService itemService;
    private final ProcurementPackageService packageService;
    private final ProcurementN8nHelper procurementN8nHelper;

    @Autowired
    public ProcurementSupplierSearchWorkflow(
            ProcurementItemService itemService,
            ProcurementPackageService packageService,
            ProcurementN8nHelper procurementN8nHelper) {
        this.itemService = itemService;
        this.packageService = packageService;
        this.procurementN8nHelper = procurementN8nHelper;
    }

    public Map<String, Object> searchByPackage(UUID packageId, String query) {
        ProcurementPackageDto procurementPackage = packageService.get(packageId);
        if (procurementPackage == null) {
            throw new IllegalStateException("Procurement package not found: " + packageId);
        }

        List<ProcurementItemDto> items = itemService.listByPackageId(packageId);
        Map<String, Object> payload = new HashMap<>();
        payload.put("packageId", packageId.toString());
        payload.put("coverageThreshold", procurementPackage.getCoverageThreshold() != null
            ? procurementPackage.getCoverageThreshold()
            : DEFAULT_COVERAGE_THRESHOLD);
        payload.put("suppliersLimit", procurementPackage.getSuppliersLimit() != null
            ? procurementPackage.getSuppliersLimit()
            : DEFAULT_SUPPLIERS_LIMIT);
        if (query != null && !query.isBlank()) {
            payload.put("query", query);
        }

        List<Map<String, Object>> itemPayloads = items.stream()
            .map(item -> {
                Map<String, Object> entry = new HashMap<>();
                entry.put("name", item.getName());
                return entry;
            })
            .toList();
        payload.put("items", itemPayloads);

        ParsedN8nResponse response = procurementN8nHelper.post("/webhook/procurement/web-price", payload);
        JsonNode parsed = procurementN8nHelper.normalizeArrayField(response.parsed(), "suppliers");

        Map<String, Object> result = new HashMap<>();
        result.put("raw", response.output());
        result.put("parsed", parsed);
        return result;
    }

    public Map<String, Object> searchByItem(String itemName) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("item", itemName);

        ParsedN8nResponse response = procurementN8nHelper.post("/webhook/procurement/web-price", payload);
        JsonNode parsed = procurementN8nHelper.normalizeArrayField(response.parsed(), "suppliers");

        Map<String, Object> result = new HashMap<>();
        result.put("raw", response.output());
        result.put("parsed", parsed);
        return result;
    }
}
