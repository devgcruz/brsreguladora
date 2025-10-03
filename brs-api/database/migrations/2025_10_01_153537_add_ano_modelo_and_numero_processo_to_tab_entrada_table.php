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
        Schema::table('tab_entrada', function (Blueprint $table) {
            // Adicionar campo ANO_MODELO após ANO_VEIC
            $table->string('ANO_MODELO', 4)->nullable()->after('ANO_VEIC');
            
            // Adicionar campo NUMERO_PROCESSO após TIPO
            $table->string('NUMERO_PROCESSO', 100)->nullable()->after('TIPO');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tab_entrada', function (Blueprint $table) {
            // Remover campos adicionados
            $table->dropColumn(['ANO_MODELO', 'NUMERO_PROCESSO']);
        });
    }
};
