package com.fersacare.api.chamados.controller;

import com.fersacare.api.chamados.dto.ChamadoDTO;
import com.fersacare.api.chamados.dto.NovoChamadoRequest;
import com.fersacare.api.chamados.dto.RegistrarSolucaoRequest;
import com.fersacare.api.chamados.service.ChamadoService;
import com.fersacare.api.security.UsuarioAutenticado;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/chamados")
public class ChamadoController {

    private final ChamadoService chamadoService;
    private final UsuarioAutenticado usuarioAutenticado;

    public ChamadoController(ChamadoService chamadoService, UsuarioAutenticado usuarioAutenticado) {
        this.chamadoService = chamadoService;
        this.usuarioAutenticado = usuarioAutenticado;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('MECANICO', 'CLIENTE')")
    public ChamadoDTO abrir(@Valid @RequestBody NovoChamadoRequest req, JwtAuthenticationToken auth) {
        return chamadoService.abrir(req, usuarioAutenticado.id(auth));
    }

    @GetMapping
    public List<ChamadoDTO> listar(JwtAuthenticationToken auth) {
        return chamadoService.listar(usuarioAutenticado.id(auth), podeVerTodos(auth));
    }

    @GetMapping("/{id}")
    public ChamadoDTO buscarDetalhe(@PathVariable UUID id, JwtAuthenticationToken auth) {
        return chamadoService.buscarDetalhe(id, usuarioAutenticado.id(auth), podeVerTodos(auth));
    }

    @PostMapping("/{id}/assumir")
    @PreAuthorize("hasAnyRole('TECNICO', 'ADMIN')")
    public ChamadoDTO assumir(@PathVariable UUID id, JwtAuthenticationToken auth) {
        return chamadoService.assumir(id, usuarioAutenticado.id(auth));
    }

    @PostMapping("/{id}/solucao")
    @PreAuthorize("hasAnyRole('TECNICO', 'ADMIN')")
    public ChamadoDTO registrarSolucao(
        @PathVariable UUID id,
        @Valid @RequestBody RegistrarSolucaoRequest req,
        JwtAuthenticationToken auth
    ) {
        return chamadoService.registrarSolucao(id, req, usuarioAutenticado.id(auth));
    }

    private boolean podeVerTodos(JwtAuthenticationToken auth) {
        return auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_TECNICO") || a.getAuthority().equals("ROLE_ADMIN"));
    }
}
