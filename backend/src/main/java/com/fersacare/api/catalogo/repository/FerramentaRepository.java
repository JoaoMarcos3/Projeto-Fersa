package com.fersacare.api.catalogo.repository;

import com.fersacare.api.catalogo.dto.FerramentaDTO;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public class FerramentaRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public FerramentaRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<FerramentaDTO> buscarPorPeca(UUID pecaId) {
        String sql = """
            select f.id, f.nome, f.descricao, f.uso, f.procedimento
            from ferramentas f
            join peca_ferramentas pf on pf.ferramenta_id = f.id
            where pf.peca_id = :pecaId
            order by f.nome
            """;
        return jdbc.query(sql, new MapSqlParameterSource("pecaId", pecaId), (rs, rowNum) -> new FerramentaDTO(
            UUID.fromString(rs.getString("id")),
            rs.getString("nome"),
            rs.getString("descricao"),
            rs.getString("uso"),
            rs.getString("procedimento")
        ));
    }

    public List<FerramentaDTO> listarTodas() {
        return jdbc.query(
            "select id, nome, descricao, uso, procedimento from ferramentas order by nome",
            (rs, rowNum) -> new FerramentaDTO(
                UUID.fromString(rs.getString("id")),
                rs.getString("nome"),
                rs.getString("descricao"),
                rs.getString("uso"),
                rs.getString("procedimento")
            ));
    }
}
