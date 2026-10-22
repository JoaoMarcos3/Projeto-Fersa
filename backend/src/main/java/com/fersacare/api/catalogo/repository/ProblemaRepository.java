package com.fersacare.api.catalogo.repository;

import com.fersacare.api.catalogo.dto.ProblemaDTO;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Array;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Repository
public class ProblemaRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public ProblemaRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<ProblemaDTO> buscarPorPeca(UUID pecaId) {
        String sql = """
            select pr.id, pr.titulo, pr.causas, pr.verificar, pr.solucao, pr.quando_tecnico
            from problemas pr
            join peca_problemas pp on pp.problema_id = pr.id
            where pp.peca_id = :pecaId
            order by pr.titulo
            """;
        return jdbc.query(sql, new MapSqlParameterSource("pecaId", pecaId), (rs, rowNum) -> new ProblemaDTO(
            UUID.fromString(rs.getString("id")),
            rs.getString("titulo"),
            rs.getString("causas"),
            paraListaDeTexto(rs.getArray("verificar")),
            rs.getString("solucao"),
            rs.getString("quando_tecnico")
        ));
    }

    public List<ProblemaDTO> listarTodos() {
        String sql = "select id, titulo, causas, verificar, solucao, quando_tecnico from problemas order by titulo";
        return jdbc.query(sql, (rs, rowNum) -> new ProblemaDTO(
            UUID.fromString(rs.getString("id")),
            rs.getString("titulo"),
            rs.getString("causas"),
            paraListaDeTexto(rs.getArray("verificar")),
            rs.getString("solucao"),
            rs.getString("quando_tecnico")
        ));
    }

    /** O driver JDBC do Postgres devolve text[] como java.sql.Array — convertemos para List<String>. */
    private static List<String> paraListaDeTexto(Array coluna) {
        if (coluna == null) return List.of();
        try {
            String[] valores = (String[]) coluna.getArray();
            return Arrays.asList(valores);
        } catch (SQLException e) {
            throw new IllegalStateException("Falha ao ler coluna array do Postgres", e);
        }
    }
}
