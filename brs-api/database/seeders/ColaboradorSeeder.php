<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Colaborador;

class ColaboradorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Verificar se já existem colaboradores
        if (Colaborador::count() > 0) {
            $this->command->info('Colaboradores já existem na base de dados.');
            return;
        }

        $colaboradores = [
            [
                'nome' => 'João Silva',
                'cpf' => '123.456.789-01',
                'email' => 'joao.silva@exemplo.com',
                'celular' => '(11) 99999-9999',
            ],
            [
                'nome' => 'Maria Santos',
                'cpf' => '987.654.321-02',
                'email' => 'maria.santos@exemplo.com',
                'celular' => '(11) 88888-8888',
            ],
            [
                'nome' => 'Pedro Oliveira',
                'cpf' => '456.789.123-03',
                'email' => 'pedro.oliveira@exemplo.com',
                'celular' => '(11) 77777-7777',
            ],
            [
                'nome' => 'Ana Costa',
                'cpf' => '789.123.456-04',
                'email' => 'ana.costa@exemplo.com',
                'celular' => '(11) 66666-6666',
            ],
            [
                'nome' => 'Carlos Ferreira',
                'cpf' => '321.654.987-05',
                'email' => 'carlos.ferreira@exemplo.com',
                'celular' => '(11) 55555-5555',
            ],
        ];

        foreach ($colaboradores as $colaborador) {
            Colaborador::create($colaborador);
        }

        $this->command->info('Colaboradores criados com sucesso!');
    }
}
