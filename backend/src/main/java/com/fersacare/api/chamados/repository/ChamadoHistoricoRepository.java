package com.fersacare.api.chamados.repository;

import com.fersacare.api.chamados.dto.HistoricoItemDTO;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public class ChamadoHistoricoRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public ChamadoHistoricoRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void registrar(UUID chamadoId, UUID autorId, String texto) {
        jdbc.update(
            "insert into chamado_historico (chamado_id, autor_id, texto) values (:chamadoId, :autorId, :texto)",
            new MapSqlParameterSource()
                .addValue("chamadoId", chamadoId)
                .addValue("autorId", autorId)
                .addValue("texto", texto));
    }

    public List<HistoricoItemDTO> listarPorChamado(UUID chamadoId) {
        String sql = "select texto, criado_em from chamado_historico where chamado_id = :chamadoId order by criado_em asc";
        return jdbc.query(sql, new MapSqlParameterSource("chamadoId", chamadoId),
            (rs, rowNum) -> new HistoricoItemDTO(rs.getString("texto"), rs.getTimestamp("criado_em").toInstant()));
    }
}
