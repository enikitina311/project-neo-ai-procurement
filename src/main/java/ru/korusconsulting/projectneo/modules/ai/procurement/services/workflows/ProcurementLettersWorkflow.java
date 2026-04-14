package ru.korusconsulting.projectneo.modules.ai.procurement.services.workflows;

import java.util.ArrayList;
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
import ru.korusconsulting.projectneo.modules.ai.procurement.services.letters.ProcurementLetterService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.letters.dto.request.ProcurementLetterDtoRequest;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.letters.dto.response.ProcurementLetterDto;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.packages.ProcurementPackageService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.packages.dto.response.ProcurementPackageDto;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.suppliers.ProcurementSupplierService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.suppliers.dto.response.ProcurementSupplierDto;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.support.ProcurementN8nHelper;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.support.ProcurementN8nHelper.ParsedN8nResponse;

@Service
@Slf4j
public class ProcurementLettersWorkflow {
    private final ProcurementPackageService packageService;
    private final ProcurementItemService itemService;
    private final ProcurementSupplierService supplierService;
    private final ProcurementLetterService letterService;
    private final ProcurementN8nHelper procurementN8nHelper;

    @Autowired
    public ProcurementLettersWorkflow(
            ProcurementPackageService packageService,
            ProcurementItemService itemService,
            ProcurementSupplierService supplierService,
            ProcurementLetterService letterService,
            ProcurementN8nHelper procurementN8nHelper) {
        this.packageService = packageService;
        this.itemService = itemService;
        this.supplierService = supplierService;
        this.letterService = letterService;
        this.procurementN8nHelper = procurementN8nHelper;
    }

    public List<ProcurementLetterDto> generate(UUID packageId) {
        ProcurementPackageDto packageDto = packageService.get(packageId);
        if (packageDto == null) {
            throw new IllegalStateException("Procurement package not found: " + packageId);
        }

        List<ProcurementItemDto> items = itemService.listByPackageId(packageId);
        List<ProcurementSupplierDto> suppliers = supplierService.listSelectedByPackageId(packageId);
        if (suppliers.isEmpty()) {
            suppliers = supplierService.listByPackageId(packageId);
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("package", packageDto);
        payload.put("items", items);
        payload.put("suppliers", suppliers);

        letterService.deleteByPackageId(packageId);

        ParsedN8nResponse response = procurementN8nHelper.post("/webhook/procurement/generate-letters", payload);
        JsonNode parsed = response.parsed();

        if (parsed == null || !parsed.has("drafts") || !parsed.get("drafts").isArray()) {
            if (response.output() != null && !response.output().isBlank()) {
                log.warn("Letter generation returned non-draft payload for package {}", packageId);
            }
            return List.of();
        }

        List<ProcurementLetterDto> created = new ArrayList<>();
        for (JsonNode draft : parsed.get("drafts")) {
            String supplierIdValue = textValue(draft.get("supplierId"));
            String supplierNameValue = textValue(draft.get("supplierName"));
            ProcurementSupplierDto supplier = findSupplier(suppliers, supplierIdValue, supplierNameValue);
            if (supplier == null) {
                log.warn(
                    "Skipping letter draft for package {} because supplier could not be resolved: supplierId={}, supplierName={}",
                    packageId,
                    supplierIdValue,
                    supplierNameValue);
                continue;
            }

            ProcurementLetterDtoRequest request = new ProcurementLetterDtoRequest();
            request.setPackageId(packageId);
            request.setSupplierId(supplier.getId());
            request.setSubject(textValue(draft.get("subject")));
            request.setBody(textValue(draft.get("body")));
            request.setStatus("draft");
            created.add(letterService.create(request));
        }

        return created;
    }

    private ProcurementSupplierDto findSupplier(
            List<ProcurementSupplierDto> suppliers,
            String supplierIdValue,
            String supplierNameValue) {
        if (supplierIdValue != null && !supplierIdValue.isBlank()) {
            for (ProcurementSupplierDto supplier : suppliers) {
                if (supplier.getId() != null && supplier.getId().toString().equals(supplierIdValue)) {
                    return supplier;
                }
            }
        }

        if (supplierNameValue != null && !supplierNameValue.isBlank()) {
            for (ProcurementSupplierDto supplier : suppliers) {
                if (supplier.getName() != null && supplier.getName().equalsIgnoreCase(supplierNameValue)) {
                    return supplier;
                }
            }
        }

        return null;
    }

    private String textValue(JsonNode node) {
        return node != null && !node.isNull() ? node.asText() : null;
    }
}
