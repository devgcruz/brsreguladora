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
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 255);
            $table->string('Usuario', 100)->unique();
            $table->string('Senha', 255);
            $table->integer('nivel')->default(1);
            $table->string('email', 255)->nullable();
            $table->string('cargo', 100)->nullable();
            $table->json('permissoes')->nullable();
            $table->string('status', 20)->default('ativo');
            $table->timestamp('ultimo_acesso')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};

