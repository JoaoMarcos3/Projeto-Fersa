package com.fersacare.api.catalogo.repository;

import com.fersacare.api.catalogo.dto.AplicacaoDTO;
import com.fersacare.api.catalogo.dto.PecaResumoDTO;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * A busca tradicional do FERSA Care (ver prototipo-web): Part Number,
 * aplicação, veículo, modelo, categoria ou texto livre ("geral"). Um
 * Part Number como "frs 1001" ou "FRS-1001" precisa achar a mesma peça —
 * por isso comparamos sem espaço/hífen (regexp_replace), igual ao mock
 * do frontend (api.js: pn.replace(/[\s-]/g, "")).
 *
 * Duas consultas, não uma: a primeira decide QUAIS peças correspondem ao
 * filtro (pode ser por causa de uma aplicação específica); a segunda traz
 * TODAS as aplicações dessas peças — se buscasse tudo numa query só, uma
 * peça encontrada por "Scania" apareceria na lista só com a aplicação
 * Scania, escondendo as outras aplicações dela. Testado linha a linha
 * contra um Postgres real antes de ir para este arquivo.
 */
@Repository
public class PecaRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public PecaRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final String SQL_IDS_POR_FILTRO = """
        select distinct p.id, p.part_number
        from pecas p
        left join peca_aplicacoes pa on pa.peca_id = p.id
        left join aplicacoes a on a.id = pa.aplicacao_id
        where
          (:modo = 'partNumber' and regexp_replace(lower(p.part_number), '[\\s-]', '', 'g') like '%' || :termoNorm || '%')
          or (:modo = 'categoria' and lower(p.categoria) like '%' || :termo || '%')
          or (:modo = 'veiculo' and lower(a.veiculo) like '%' || :termo || '%')
          or (:modo = 'modelo' and lower(a.modelo) like '%' || :termo || '%')
          or (:modo = 'aplicacao' and lower(coalesce(a.veiculo,'') || ' ' || coalesce(a.modelo,'')) like '%' || :termo || '%')
          or (:modo = 'geral' and (
                regexp_replace(lower(p.part_number), '[\\s-]', '', 'g') like '%' || :termoNorm || '%'
                or lower(p.nome) like '%' || :termo || '%'
                or lower(p.categoria) like '%' || :termo || '%'
                or lower(coalesce(a.veiculo,'') || ' ' || coalesce(a.modelo,'')) like '%' || :termo || '%'
             ))
        order by p.part_number
        """;

    /** Modos válidos: partNumber, categoria, veiculo, modelo, aplicacao, geral. */
    public List<PecaResumoDTO> buscarPorFiltro(String termo, String modo) {
        String termoLower = termo == null ? "" : termo.trim().toLowerCase();
        String termoNorm = termoLower.replaceAll("[\\s-]", "");
        String modoValido = modo == null ? "geral" : modo;

        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("modo", modoValido)
            .addValue("termo", termoLower)
            .addValue("termoNorm", termoNorm);

        List<UUID> ids = jdbc.query(SQL_IDS_POR_FILTRO, params,
            (rs, rowNum) -> UUID.fromString(rs.getString("id")));

        return resumoPorIds(ids);
    }

    public Optional<PecaResumoDTO> buscarResumoPorId(UUID id) {
        List<PecaResumoDTO> resultado = resumoPorIds(List.of(id));
        return resultado.isEmpty() ? Optional.empty() : Optional.of(resultado.get(0));
    }

    /** Monta o resumo (part_number, nome, categoria + todas as aplicações) preservando a ordem recebida. */
    private List<PecaResumoDTO> resumoPorIds(List<UUID> ids) {
        if (ids.isEmpty()) return List.of();

        String sql = """
            select p.id, p.part_number, p.nome, p.categoria, a.veiculo, a.modelo
            from pecas p
            left join peca_aplicacoes pa on pa.peca_id = p.id
            left join aplicacoes a on a.id = pa.aplicacao_id
            where p.id in (:ids)
            order by p.part_number, a.veiculo
            """;

        Map<UUID, String> partNumber = new LinkedHashMap<>();
        Map<UUID, String> nome = new LinkedHashMap<>();
        Map<UUID, String> categoria = new LinkedHashMap<>();
        Map<UUID, List<AplicacaoDTO>> aplicacoesPorPeca = new LinkedHashMap<>();

        // garante a ordem de `ids` mesmo que o SQL devolva em outra ordem
        for (UUID id : ids) aplicacoesPorPeca.put(id, new ArrayList<>());

        jdbc.query(sql, new MapSqlParameterSource("ids", ids), rs -> {
            UUID id = UUID.fromString(rs.getString("id"));
            partNumber.put(id, rs.getString("part_number"));
            nome.put(id, rs.getString("nome"));
            categoria.put(id, rs.getString("categoria"));
            String veiculo = rs.getString("veiculo");
            if (veiculo != null) {
                aplicacoesPorPeca.get(id).add(new AplicacaoDTO(veiculo, rs.getString("modelo")));
            }
        });

        List<PecaResumoDTO> resultado = new ArrayList<>();
        for (UUID id : ids) {
            if (!partNumber.containsKey(id)) continue; // id não existe mais (peça excluída entre as duas queries)
            resultado.add(new PecaResumoDTO(id, partNumber.get(id), nome.get(id), categoria.get(id), aplicacoesPorPeca.get(id)));
        }
        return resultado;
    }

    public Optional<String> buscarImagemDescricao(UUID id) {
        try {
            String valor = jdbc.queryForObject(
                "select imagem_descricao from pecas where id = :id",
                new MapSqlParameterSource("id", id), String.class);
            return Optional.ofNullable(valor);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }
}
