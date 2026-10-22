package com.fersacare.api.catalogo.repository;

import com.fersacare.api.catalogo.dto.PassoDTO;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public class TutorialPassoRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public TutorialPassoRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<PassoDTO> buscarPorPeca(UUID pecaId) {
        String sql = "select ordem, titulo, texto, imagem_url from tutorial_passos where peca_id = :pecaId order by ordem";
        return jdbc.query(sql, new MapSqlParameterSource("pecaId", pecaId), (rs, rowNum) -> new PassoDTO(
            rs.getInt("ordem"),
            rs.getString("titulo"),
            rs.getString("texto"),
            rs.getString("imagem_url")
        ));
    }
}
