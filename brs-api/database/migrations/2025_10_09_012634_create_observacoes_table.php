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
        Schema::create('observacoes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('entrada_id');
            $table->unsignedBigInteger('usuario_id');
            $table->text('texto');
            $table->timestamps();

            // Chaves estrangeiras
            $table->foreign('entrada_id')->references('Id_Entrada')->on('tab_entrada')->onDelete('cascade');
            $table->foreign('usuario_id')->references('id')->on('usuarios')->onDelete('cascade');
            
            // Índices para performance
            $table->index('entrada_id');
            $table->index('usuario_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('observacoes');
    }
};
