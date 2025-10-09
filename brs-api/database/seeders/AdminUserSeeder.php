<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Verificar se o usuário já existe
        $existingUser = Usuario::where('Usuario', 'gui')->first();
        
        if ($existingUser) {
            $this->command->info('Usuário administrador "gui" já existe!');
            return;
        }

        // Criar usuário administrador
        $adminUser = Usuario::create([
            'nome' => 'Administrador',
            'Usuario' => 'gui',
            'email' => 'gui@admin.com',
            'Senha' => Hash::make('gui'),
            'nivel' => 5, // Nível máximo para administrador
            'cargo' => 'Administrador',
            'permissoes' => [
                'dashboard',
                'registros',
                'financeiro',
                'judicial',
                'prestadores',
                'relatorios',
                'usuarios',
                'auditoria'
            ],
            'status' => 'ativo',
            'ultimo_acesso' => now()
        ]);

        // Atribuir role de administrador se estiver usando Spatie Permission
        try {
            $adminUser->assignRole('Administrador');
        } catch (\Exception $e) {
            $this->command->warn('Role "Administrador" não encontrada. Usuário criado sem role específica.');
        }

        $this->command->info('Usuário administrador criado com sucesso!');
        $this->command->info('Usuário: gui');
        $this->command->info('Senha: gui');
        $this->command->info('Nível: 5 (Administrador)');
    }
}
