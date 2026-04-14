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
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpanalysis.ProcurementKpAnalysisService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpanalysis.dto.response.ProcurementKpAnalysisDto;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpdocuments.ProcurementKpDocumentService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.kpdocuments.dto.response.ProcurementKpDocumentDto;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.nmc.ProcurementNmcResultService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.nmc.dto.response.ProcurementNmcResultDto;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.suppliers.ProcurementSupplierService;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.suppliers.dto.response.ProcurementSupplierDto;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.support.ProcurementN8nHelper;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.support.ProcurementN8nHelper.ParsedN8nResponse;

@Service
@Slf4j
public class ProcurementNmcWorkflow {
    private final ProcurementItemService itemService;
    private final ProcurementSupplierService supplierService;
    private final ProcurementKpDocumentService kpDocumentService;
    private final ProcurementKpAnalysisService kpAnalysisService;
    private final ProcurementNmcResultService nmcResultService;
    private final ProcurementN8nHelper procurementN8nHelper;

    @Autowired
    public ProcurementNmcWorkflow(
            ProcurementItemService itemService,
            ProcurementSupplierService supplierService,
            ProcurementKpDocumentService kpDocumentService,
            ProcurementKpAnalysisService kpAnalysisService,
            ProcurementNmcResultService nmcResultService,
            ProcurementN8nHelper procurementN8nHelper) {
        this.itemService = itemService;
        this.supplierService = supplierService;
        this.kpDocumentService = kpDocumentService;
        this.kpAnalysisService = kpAnalysisService;
        this.nmcResultService = nmcResultService;
        this.procurementN8nHelper = procurementN8nHelper;
    }

    public ProcurementNmcResultDto generate(UUID packageId) {
        List<ProcurementItemDto> items = itemService.listByPackageId(packageId);
        List<ProcurementSupplierDto> suppliers = supplierService.listByPackageId(packageId);
        List<ProcurementKpDocumentDto> documents = kpDocumentService.listByPackageId(packageId);

        List<Map<String, Object>> offers = new ArrayList<>();
        for (ProcurementKpDocumentDto document : documents) {
            ProcurementKpAnalysisDto analysis = kpAnalysisService.findByKpDocumentId(document.getId());
            if (analysis == null || analysis.getExtractedItemsJson() == null) {
                continue;
            }

            Map<String, Object> offer = new HashMap<>();
            offer.put("supplierId", document.getSupplierId());
            ProcurementSupplierDto supplier = findSupplier(suppliers, document.getSupplierId());
            if (supplier != null) {
                offer.put("supplierName", supplier.getName());
            } else {
                log.warn("Supplier {} referenced by KP document {} was not found", document.getSupplierId(), document.getId());
            }

            offer.put("items", analysis.getExtractedItemsJson());
            offers.add(offer);
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("items", items);
        payload.put("offers", offers);

        ParsedN8nResponse response = procurementN8nHelper.post("/webhook/procurement/nmc", payload);
        JsonNode parsed = response.parsed();

        ProcurementNmcResultDto result = new ProcurementNmcResultDto();
        result.setPackageId(packageId);
        if (parsed != null) {
            result.setNmcTableJson(parsed.toString());
            result.setNmcTableText(parsed.has("table") ? parsed.get("table").asText() : response.output());
        } else {
            result.setNmcTableText(response.output());
        }

        return nmcResultService.saveOrUpdate(result);
    }

    private ProcurementSupplierDto findSupplier(List<ProcurementSupplierDto> suppliers, UUID supplierId) {
        if (supplierId == null) {
            return null;
        }

        for (ProcurementSupplierDto supplier : suppliers) {
            if (supplierId.equals(supplier.getId())) {
                return supplier;
            }
        }

        return null;
    }
}
