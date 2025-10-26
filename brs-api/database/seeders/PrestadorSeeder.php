<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Prestador;
use App\Models\Parceiro;
use Illuminate\Support\Facades\Hash;

class PrestadorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Verificar se já existem prestadores
        if (Prestador::count() > 0) {
            $this->command->info('Prestadores já existem no banco de dados.');
            return;
        }

        // Buscar ou criar um parceiro padrão
        $parceiro = Parceiro::first();
        if (!$parceiro) {
            $parceiro = Parceiro::create([
                'NOME' => 'Parceiro Padrão',
                'STATUS' => 'Ativo'
            ]);
        }

        // Criar prestadores de exemplo
        $prestadores = [
            [
                'FK_PARCEIRO' => $parceiro->ID_PARCEIRO,
                'NOME' => 'João Silva',
                'LOGIN' => 'joao.silva',
                'SENHA' => '123456'
            ],
            [
                'FK_PARCEIRO' => $parceiro->ID_PARCEIRO,
                'NOME' => 'Maria Santos',
                'LOGIN' => 'maria.santos',
                'SENHA' => '123456'
            ],
            [
                'FK_PARCEIRO' => $parceiro->ID_PARCEIRO,
                'NOME' => 'Pedro Oliveira',
                'LOGIN' => 'pedro.oliveira',
                'SENHA' => '123456'
            ],
            [
                'FK_PARCEIRO' => $parceiro->ID_PARCEIRO,
                'NOME' => 'Ana Costa',
                'LOGIN' => 'ana.costa',
                'SENHA' => '123456'
            ],
            [
                'FK_PARCEIRO' => $parceiro->ID_PARCEIRO,
                'NOME' => 'Carlos Ferreira',
                'LOGIN' => 'carlos.ferreira',
                'SENHA' => '123456'
            ]
        ];

        foreach ($prestadores as $prestadorData) {
            Prestador::create($prestadorData);
        }

        $this->command->info('Prestadores criados com sucesso!');
    }
}






