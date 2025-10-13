<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class CreateRolesAndPermissions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'brs:create-roles-permissions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cria roles e permissões básicas do sistema BRS';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Criando permissões e roles...');

        // Criar permissões básicas
        $permissions = [
            'dashboard',
            'registros',
            'financeiro',
            'judicial',
            'prestadores',
            'relatorios',
            'usuarios',
            'auditoria'
        ];

        foreach ($permissions as $permission) {
            $permissionModel = Permission::firstOrCreate(['name' => $permission]);
            $this->line("✓ Permissão criada: {$permission}");
        }

        // Criar roles básicos
        $roles = [
            'Administrador' => [
                'dashboard',
                'registros',
                'financeiro',
                'judicial',
                'prestadores',
                'relatorios',
                'usuarios',
                'auditoria'
            ],
            'Analista' => [
                'dashboard',
                'registros',
                'financeiro',
                'judicial',
                'prestadores',
                'relatorios'
            ],
            'Operador' => [
                'dashboard',
                'registros',
                'prestadores'
            ]
        ];

        foreach ($roles as $roleName => $rolePermissions) {
            $role = Role::firstOrCreate(['name' => $roleName]);
            $role->syncPermissions($rolePermissions);
            $this->line("✓ Role criado: {$roleName} com " . count($rolePermissions) . " permissões");
        }

        $this->info('Roles e permissões criados com sucesso!');
        
        return 0;
    }
}
