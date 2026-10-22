package com.fersacare.api.chamados.repository;

import com.fersacare.api.chamados.model.PrioridadeChamado;
import com.fersacare.api.chamados.model.StatusChamado;
import com.fersacare.api.chamados.dto.ChamadoDTO;
import com.fersacare.api.chamados.dto.NovoChamadoRequest;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Sem ORM: o INSERT usa RETURNING para capturar numa só viagem ao banco
 * tudo que o Postgres gera sozinho (id, numero pela sequence, protocolo
 * pelo trigger, criado_em/atualizado_em pelo default) — por isso o
 * ChamadoDTO devolvido por `inserir` já sai completo, sem precisar de
 * um SELECT extra depois. Testado linha a linha contra um Postgres real
 * antes de ir para este arquivo (insert, update de status, joins).
 */
@Repository
public class ChamadoRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public ChamadoRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final String SELECT_BASE = """
        select c.id, c.numero, c.protocolo, c.status, c.prioridade, c.assunto, c.descricao,
               c.peca_id, p.part_number, c.aplicacao_texto,
               c.solicitante_id, sp.nome as solicitante_nome,
               c.tecnico_id, tp.nome as tecnico_nome,
               c.origem_ia, c.solucao_tecnico, c.criado_em, c.atualizado_em
        from chamados c
        left join pecas p on p.id = c.peca_id
        join profiles sp on sp.id = c.solicitante_id
        left join profiles tp on tp.id = c.tecnico_id
        """;

    private static final RowMapper<ChamadoDTO> MAPPER = (rs, rowNum) -> {
        UUID pecaId = rs.getString("peca_id") != null ? UUID.fromString(rs.getString("peca_id")) : null;
        UUID tecnicoId = rs.getString("tecnico_id") != null ? UUID.fromString(rs.getString("tecnico_id")) : null;
        Timestamp atualizado = rs.getTimestamp("atualizado_em");
        return new ChamadoDTO(
            UUID.fromString(rs.getString("id")),
            rs.getLong("numero"),
            rs.getString("protocolo"),
            StatusChamado.valueOf(rs.getString("status")),
            PrioridadeChamado.valueOf(rs.getString("prioridade")),
            rs.getString("assunto"),
            rs.getString("descricao"),
            pecaId,
            rs.getString("part_number"),
            rs.getString("aplicacao_texto"),
            UUID.fromString(rs.getString("solicitante_id")),
            rs.getString("solicitante_nome"),
            tecnicoId,
            rs.getString("tecnico_nome"),
            rs.getBoolean("origem_ia"),
            rs.getString("solucao_tecnico"),
            rs.getTimestamp("criado_em").toInstant(),
            atualizado == null ? null : atualizado.toInstant(),
            List.of() // histórico é carregado à parte pelo ChamadoHistoricoRepository
        );
    };

    public ChamadoDTO inserir(NovoChamadoRequest req, UUID solicitanteId) {
        // :prioridade precisa do cast explícito — sem ele o Postgres recusa o
        // bind parameter de texto contra a coluna enum prioridade_chamado
        // ("column is of type prioridade_chamado but expression is of type
        // character varying"). Confirmado contra um Postgres real.
        String sql = """
            insert into chamados (assunto, descricao, peca_id, aplicacao_texto, solicitante_id, prioridade)
            values (:assunto, :descricao, :pecaId, :aplicacaoTexto, :solicitanteId, :prioridade::prioridade_chamado)
            returning id
            """;
        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("assunto", req.assunto())
            .addValue("descricao", req.descricao())
            // Types.OTHER: pecaId é opcional (pode ser null) numa coluna uuid —
            // sem declarar o tipo, um valor nulo pode ser enviado como VARCHAR
            // e rejeitado pelo Postgres ("column is of type uuid but expression
            // is of type character varying"). Types.OTHER é o padrão usual para
            // uuid/null com o driver do Postgres.
            .addValue("pecaId", req.pecaId(), java.sql.Types.OTHER)
            .addValue("aplicacaoTexto", req.aplicacaoTexto())
            .addValue("solicitanteId", solicitanteId)
            .addValue("prioridade", (req.prioridade() == null ? PrioridadeChamado.MEDIA : req.prioridade()).name());

        UUID novoId = jdbc.queryForObject(sql, params, UUID.class);
        return buscarPorId(novoId).orElseThrow(() ->
            new IllegalStateException("Chamado recém-criado não encontrado: " + novoId));
    }

    public Optional<ChamadoDTO> buscarPorId(UUID id) {
        try {
            return Optional.ofNullable(
                jdbc.queryForObject(SELECT_BASE + " where c.id = :id", new MapSqlParameterSource("id", id), MAPPER));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<ChamadoDTO> listarTodos() {
        return jdbc.query(SELECT_BASE + " order by c.criado_em desc", MAPPER);
    }

    public List<ChamadoDTO> listarPorSolicitante(UUID solicitanteId) {
        return jdbc.query(SELECT_BASE + " where c.solicitante_id = :id order by c.criado_em desc",
            new MapSqlParameterSource("id", solicitanteId), MAPPER);
    }

    public void assumir(UUID chamadoId, UUID tecnicoId) {
        jdbc.update(
            "update chamados set status = 'EM_ATENDIMENTO', tecnico_id = :tecnicoId, atualizado_em = now() where id = :id",
            new MapSqlParameterSource().addValue("tecnicoId", tecnicoId).addValue("id", chamadoId));
    }

    public void registrarSolucao(UUID chamadoId, String solucao) {
        jdbc.update(
            "update chamados set status = 'RESOLVIDO', solucao_tecnico = :solucao, atualizado_em = now() where id = :id",
            new MapSqlParameterSource().addValue("solucao", solucao).addValue("id", chamadoId));
    }
}
