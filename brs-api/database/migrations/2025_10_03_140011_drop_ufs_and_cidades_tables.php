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
        // Remover tabelas UF e cidades (não são mais necessárias)
        // pois agora usamos dados fixos do JSON e cache local
        Schema::dropIfExists('cidades');
        Schema::dropIfExists('ufs');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recriar tabelas se necessário (para rollback)
        Schema::create('ufs', function (Blueprint $table) {
            $table->id();
            $table->string('sigla', 2)->unique();
            $table->string('nome', 100);
            $table->timestamps();
        });

        Schema::create('cidades', function (Blueprint $table) {
            $table->id();
            $table->string('nome', 100);
            $table->unsignedBigInteger('uf_id');
            $table->timestamps();
            
            $table->foreign('uf_id')->references('id')->on('ufs')->onDelete('cascade');
        });
    }
};
