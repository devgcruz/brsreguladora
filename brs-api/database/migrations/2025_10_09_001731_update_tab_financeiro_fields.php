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
        Schema::table('tab_financeiro', function (Blueprint $table) {
            // Remover campos antigos que não são mais necessários
            $table->dropColumn([
                'DATA_NF',
                'NUM_NF', 
                'Honorarios',
                'Data_Pagto_Honor',
                'Vlr_Despesas',
                'Data_pagto_Desp',
                'Baixa_NF',
                'Valor',
                'Data_Pagamento',
                'Banco',
                'INFO_ADICIONAIS'
            ]);
            
            // Adicionar novos campos conforme especificação
            $table->string('NUMERO_RECIBO', 100)->nullable()->after('ID_ENTRADA');
            $table->decimal('VALOR_TOTAL_RECIBO', 10, 2)->nullable()->after('NUMERO_RECIBO');
            $table->date('DATA_PAGAMENTO_RECIBO')->nullable()->after('VALOR_TOTAL_RECIBO');
            $table->date('DATA_NOTA_FISCAL')->nullable()->after('DATA_PAGAMENTO_RECIBO');
            $table->string('NUMERO_NOTA_FISCAL', 100)->nullable()->after('DATA_NOTA_FISCAL');
            $table->decimal('VALOR_NOTA_FISCAL', 10, 2)->nullable()->after('NUMERO_NOTA_FISCAL');
            $table->date('DATA_PAGAMENTO_NOTA_FISCAL')->nullable()->after('VALOR_NOTA_FISCAL');
            $table->text('OBSERVACAO')->nullable()->after('DATA_PAGAMENTO_NOTA_FISCAL');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tab_financeiro', function (Blueprint $table) {
            // Remover novos campos
            $table->dropColumn([
                'NUMERO_RECIBO',
                'VALOR_TOTAL_RECIBO',
                'DATA_PAGAMENTO_RECIBO',
                'DATA_NOTA_FISCAL',
                'NUMERO_NOTA_FISCAL',
                'VALOR_NOTA_FISCAL',
                'DATA_PAGAMENTO_NOTA_FISCAL',
                'OBSERVACAO'
            ]);
            
            // Restaurar campos antigos
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
            $table->text('INFO_ADICIONAIS')->nullable();
        });
    }
};
