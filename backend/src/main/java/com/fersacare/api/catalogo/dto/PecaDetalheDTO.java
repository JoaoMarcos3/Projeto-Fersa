package com.fersacare.api.catalogo.dto;

import java.util.List;
import java.util.UUID;

public record PecaDetalheDTO(
    UUID id,
    String partNumber,
    String nome,
    String categoria,
    String imagemDescricao,
    List<AplicacaoDTO> aplicacoes,
    List<FerramentaDTO> ferramentas,
    List<ProblemaDTO> problemas,
    LubrificacaoDTO lubrificacao,
    List<PassoDTO> passos,
    List<VideoDTO> videos
) {}
