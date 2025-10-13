<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('colaboradores', function (Blueprint $table) {
            // Tornar os campos opcionais (nullable)
            $table->string('nome', 255)->nullable()->change();
            $table->string('cpf', 14)->nullable()->change();
            $table->string('email', 255)->nullable()->change();
            $table->string('celular', 20)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('colaboradores', function (Blueprint $table) {
            // Reverter para campos obrigatórios (not null)
            $table->string('nome', 255)->nullable(false)->change();
            $table->string('cpf', 14)->nullable(false)->change();
            $table->string('email', 255)->nullable(false)->change();
            $table->string('celular', 20)->nullable(false)->change();
        });
    }
};