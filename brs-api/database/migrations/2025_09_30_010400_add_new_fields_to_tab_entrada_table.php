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
            // Novos campos básicos
            $table->string('COR', 50)->nullable()->after('TIPO');
            $table->string('RENAVAM', 20)->nullable()->after('COR');
            $table->string('NUMERO_MOTOR', 50)->nullable()->after('RENAVAM');
            
            // Campos condicionais para tipo Judicial
            $table->string('COMARCA', 100)->nullable()->after('NUMERO_MOTOR');
            $table->string('NUMERO_PROCESSO_JUDICIAL', 100)->nullable()->after('COMARCA');
            $table->string('NOTA_FISCAL', 100)->nullable()->after('NUMERO_PROCESSO_JUDICIAL');
            $table->string('NUMERO_VARA', 100)->nullable()->after('NOTA_FISCAL');
            $table->date('DATA_PAGAMENTO')->nullable()->after('NUMERO_VARA');
            $table->string('HONORARIO', 100)->nullable()->after('DATA_PAGAMENTO');
            $table->string('NOME_BANCO', 100)->nullable()->after('HONORARIO');
            $table->text('OBSERVACOES')->nullable()->after('NOME_BANCO');
            
            // Observações em formato de posts (JSON)
            $table->json('OBSERVACOES_POSTS')->nullable()->after('OBSERVACOES');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tab_entrada', function (Blueprint $table) {
            $table->dropColumn([
                'COR',
                'RENAVAM',
                'NUMERO_MOTOR',
                'COMARCA',
                'NUMERO_PROCESSO_JUDICIAL',
                'NOTA_FISCAL',
                'NUMERO_VARA',
                'DATA_PAGAMENTO',
                'HONORARIO',
                'NOME_BANCO',
                'OBSERVACOES',
                'OBSERVACOES_POSTS'
            ]);
        });
    }
};
