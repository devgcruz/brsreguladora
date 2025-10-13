<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
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
            Permission::firstOrCreate(['name' => $permission]);
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
        }

        $this->command->info('Roles e permissões criados com sucesso!');
    }
}
