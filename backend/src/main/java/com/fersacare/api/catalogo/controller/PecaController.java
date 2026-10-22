package com.fersacare.api.catalogo.controller;

import com.fersacare.api.catalogo.dto.PecaDetalheDTO;
import com.fersacare.api.catalogo.dto.PecaResumoDTO;
import com.fersacare.api.catalogo.service.PecaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Busca tradicional + ficha da peça. Qualquer usuário autenticado pode
 * ler (mecânico, técnico, admin ou cliente) — a regra de "quem pode
 * cadastrar/editar" só entra quando o módulo de escrita do CMS existir.
 */
@RestController
@RequestMapping("/api/v1/pecas")
public class PecaController {

    private final PecaService pecaService;

    public PecaController(PecaService pecaService) {
        this.pecaService = pecaService;
    }

    @GetMapping
    public List<PecaResumoDTO> buscar(
        @RequestParam(required = false) String termo,
        @RequestParam(required = false, defaultValue = "geral") String modo
    ) {
        return pecaService.buscar(termo, modo);
    }

    @GetMapping("/{id}")
    public PecaDetalheDTO buscarDetalhe(@PathVariable UUID id) {
        return pecaService.buscarDetalhe(id);
    }
}
