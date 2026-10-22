package com.fersacare.api.catalogo.repository;

import com.fersacare.api.catalogo.dto.AplicacaoDTO;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public class AplicacaoRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public AplicacaoRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<AplicacaoDTO> buscarPorPeca(UUID pecaId) {
        String sql = """
            select a.veiculo, a.modelo
            from aplicacoes a
            join peca_aplicacoes pa on pa.aplicacao_id = a.id
            where pa.peca_id = :pecaId
            order by a.veiculo
            """;
        return jdbc.query(sql, new MapSqlParameterSource("pecaId", pecaId),
            (rs, rowNum) -> new AplicacaoDTO(rs.getString("veiculo"), rs.getString("modelo")));
    }
}
