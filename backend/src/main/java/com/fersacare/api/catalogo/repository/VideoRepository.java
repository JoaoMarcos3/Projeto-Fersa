package com.fersacare.api.catalogo.repository;

import com.fersacare.api.catalogo.dto.VideoDTO;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public class VideoRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public VideoRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<VideoDTO> buscarPorPeca(UUID pecaId) {
        String sql = "select titulo, duracao_segundos, tipo, url from videos where peca_id = :pecaId order by titulo";
        return jdbc.query(sql, new MapSqlParameterSource("pecaId", pecaId), (rs, rowNum) -> {
            Object duracao = rs.getObject("duracao_segundos");
            return new VideoDTO(
                rs.getString("titulo"),
                duracao == null ? null : ((Number) duracao).intValue(),
                rs.getString("tipo"),
                rs.getString("url")
            );
        });
    }
}
