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
        Schema::create('tab_judicial', function (Blueprint $table) {
            $table->id('Id_Judicial');
            $table->unsignedBigInteger('ID_ENTRADA');
            $table->string('COMARCA', 255)->nullable();
            $table->string('NUM_PROCESSO', 100)->nullable();
            $table->string('NOTA_FISCAL', 100)->nullable();
            $table->string('NUM_VARA', 100)->nullable();
            $table->date('DT_PAGTO')->nullable();
            $table->decimal('HONORARIO', 10, 2)->nullable();
            $table->string('NOME_BANCO', 100)->nullable();
            $table->text('OBSERVACOES')->nullable();
            $table->timestamps();

            $table->foreign('ID_ENTRADA')->references('Id_Entrada')->on('tab_entrada')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tab_judicial');
    }
};

