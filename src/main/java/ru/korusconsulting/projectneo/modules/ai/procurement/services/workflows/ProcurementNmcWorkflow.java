package ru.korusconsulting.projectneo.modules.ai.procurement.services.workflows;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

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
import ru.korusconsulting.projectneo.modules.ai.procurement.services.support.ProcurementN8nHelper;
import ru.korusconsulting.projectneo.modules.ai.procurement.services.support.ProcurementN8nHelper.ParsedN8nResponse;

@Service
@Slf4j
public class ProcurementNmcWorkflow {
    private final ProcurementItemService itemService;
    private final ProcurementKpDocumentService kpDocumentService;
    private final ProcurementKpAnalysisService kpAnalysisService;
    private final ProcurementNmcResultService nmcResultService;
    private final ProcurementN8nHelper procurementN8nHelper;

    @Autowired
    public ProcurementNmcWorkflow(
            ProcurementItemService itemService,
            ProcurementKpDocumentService kpDocumentService,
            ProcurementKpAnalysisService kpAnalysisService,
            ProcurementNmcResultService nmcResultService,
            ProcurementN8nHelper procurementN8nHelper) {
        this.itemService = itemService;
        this.kpDocumentService = kpDocumentService;
        this.kpAnalysisService = kpAnalysisService;
        this.nmcResultService = nmcResultService;
        this.procurementN8nHelper = procurementN8nHelper;
    }

    public ProcurementNmcResultDto generate(UUID packageId) {
        List<ProcurementItemDto> items = itemService.listByPackageId(packageId);
        List<ProcurementKpDocumentDto> documents = kpDocumentService.listByPackageId(packageId);

        List<Map<String, Object>> offers = new ArrayList<>();
        AtomicInteger offerSequence = new AtomicInteger(1);
        for (ProcurementKpDocumentDto document : documents) {
            ProcurementKpAnalysisDto analysis = kpAnalysisService.findByKpDocumentId(document.getId());
            if (analysis == null || analysis.getExtractedItemsJson() == null) {
                continue;
            }

            Map<String, Object> offer = new HashMap<>();
            offer.put("supplierName", resolveOfferName(document, analysis, offerSequence.getAndIncrement()));
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
    private String resolveOfferName(
            ProcurementKpDocumentDto document,
            ProcurementKpAnalysisDto analysis,
            int fallbackIndex) {
        if (analysis.getSupplierName() != null && !analysis.getSupplierName().isBlank()) {
            return analysis.getSupplierName();
        }
        if (document.getSupplierName() != null && !document.getSupplierName().isBlank()) {
            return document.getSupplierName();
        }
        if (document.getFileName() != null && !document.getFileName().isBlank()) {
            return document.getFileName();
        }
        return "КП " + fallbackIndex;
    }
}
