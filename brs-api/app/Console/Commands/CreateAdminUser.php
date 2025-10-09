<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;

class CreateAdminUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:create-admin';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cria um usuário administrador com usuário=gui e senha=gui';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Verificar se o usuário já existe
        $existingUser = Usuario::where('Usuario', 'adm')->first();
        
        if ($existingUser) {
            $this->info('Usuário administrador "gui" já existe!');
            $this->info('ID: ' . $existingUser->id);
            $this->info('Nome: ' . $existingUser->nome);
            $this->info('Email: ' . $existingUser->email);
            $this->info('Nível: ' . $existingUser->nivel);
            return;
        }

        // Criar usuário administrador
        $adminUser = Usuario::create([
            'nome' => 'Administrador',
            'Usuario' => 'adm',
            'email' => 'gui@admin.com',
            'Senha' => Hash::make('123456'),
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

        $this->info('Usuário administrador criado com sucesso!');
        $this->info('ID: ' . $adminUser->id);
        $this->info('Usuário: gui');
        $this->info('Senha: gui');
        $this->info('Nome: ' . $adminUser->nome);
        $this->info('Email: ' . $adminUser->email);
        $this->info('Nível: ' . $adminUser->nivel . ' (Administrador)');
        $this->info('Status: ' . $adminUser->status);
    }
}
