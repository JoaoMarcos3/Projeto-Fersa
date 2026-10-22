package com.fersacare.api.usuarios.model;

import java.util.UUID;

/**
 * Espelha a tabela `profiles` (que estende auth.users do Supabase).
 * Record porque é só leitura — nada aqui é persistido via este objeto.
 */
public record Profile(
    UUID id,
    String nome,
    PerfilUsuario perfil,
    UUID clienteId
) {}
