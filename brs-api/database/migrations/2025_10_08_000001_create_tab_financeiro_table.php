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
        Schema::create('tab_financeiro', function (Blueprint $table) {
            $table->id('Id_Financeiro');
            $table->unsignedBigInteger('ID_ENTRADA');
            $table->date('DATA_NF')->nullable();
            $table->string('NUM_NF', 100)->nullable();
            $table->decimal('Honorarios', 10, 2)->nullable();
            $table->date('Data_Pagto_Honor')->nullable();
            $table->decimal('Vlr_Despesas', 10, 2)->nullable();
            $table->date('Data_pagto_Desp')->nullable();
            $table->string('Baixa_NF', 100)->nullable();
            $table->decimal('Valor', 10, 2)->nullable();
            $table->date('Data_Pagamento')->nullable();
            $table->string('Banco', 100)->nullable();
            $table->text('OBSERVACOES')->nullable();
            $table->text('INFO_ADICIONAIS')->nullable();
            $table->string('StatusPG', 50)->nullable();
            $table->timestamps();

            $table->foreign('ID_ENTRADA')->references('Id_Entrada')->on('tab_entrada')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tab_financeiro');
    }
};

