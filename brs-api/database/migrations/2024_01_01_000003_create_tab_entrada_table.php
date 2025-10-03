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
        Schema::create('tab_entrada', function (Blueprint $table) {
            $table->id('Id_Entrada');
            $table->unsignedBigInteger('ID_COLABORADOR')->nullable();
            $table->date('DATA_ENTRADA')->nullable();
            $table->string('MARCA', 100)->nullable();
            $table->string('VEICULO', 100)->nullable();
            $table->string('PLACA', 10)->unique()->nullable();
            $table->string('CHASSI', 50)->nullable();
            $table->string('ANO_VEIC', 4)->nullable();
            $table->string('COD_SINISTRO', 100)->nullable();
            $table->string('NUM_BO', 100)->nullable();
            $table->string('UF_SINISTRO', 2)->nullable();
            $table->string('CIDADE_SINISTRO', 100)->nullable();
            $table->string('SEGURADORA', 100)->nullable();
            $table->string('POSICAO', 100)->nullable();
            $table->string('SITUACAO', 100)->nullable();
            $table->string('UF', 2)->nullable();
            $table->string('CIDADE', 100)->nullable();
            $table->string('MES', 20)->nullable();
            $table->string('TIPO', 100)->nullable();
            $table->timestamp('DATA_REGISTRO')->useCurrent();
            $table->timestamp('DATA_ALTERACAO')->useCurrent()->useCurrentOnUpdate();
            $table->timestamps(); // Adiciona created_at e updated_at
            
            $table->foreign('ID_COLABORADOR')->references('ID_PRESTADOR')->on('tab_login_prestadores')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tab_entrada');
    }
};

