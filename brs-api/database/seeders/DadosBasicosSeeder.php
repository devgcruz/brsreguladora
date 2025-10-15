<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Posicao;
use App\Models\Marca;
use App\Models\Seguradora;

class DadosBasicosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Posições
        if (Posicao::count() === 0) {
            $posicoes = ['Pátio', 'Oficina', 'Guarda', 'Perícia', 'Vistoria'];
            foreach ($posicoes as $posicao) {
                Posicao::create(['nome' => $posicao]);
            }
            $this->command->info('Posições criadas com sucesso!');
        }

        // Marcas
        if (Marca::count() === 0) {
            $marcas = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Volkswagen', 'Fiat', 'Hyundai', 'Nissan'];
            foreach ($marcas as $marca) {
                Marca::create(['nome' => $marca]);
            }
            $this->command->info('Marcas criadas com sucesso!');
        }

        // Seguradoras
        if (Seguradora::count() === 0) {
            $seguradoras = ['Porto Seguro', 'Bradesco Seguros', 'SulAmérica', 'Tokio Marine', 'HDI Seguros', 'Mapfre'];
            foreach ($seguradoras as $seguradora) {
                Seguradora::create(['nome' => $seguradora]);
            }
            $this->command->info('Seguradoras criadas com sucesso!');
        }
    }
}
