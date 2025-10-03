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
        Schema::create('tab_pdf', function (Blueprint $table) {
            $table->id('ID_PDF');
            $table->unsignedBigInteger('ID_ENTRADA');
            $table->string('DESCRICAO', 255)->nullable();
            $table->string('CAMINHOPDF', 255);
            $table->timestamp('DATA_REGISTRO')->useCurrent();
            $table->timestamps();

            $table->foreign('ID_ENTRADA')->references('Id_Entrada')->on('tab_entrada')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tab_pdf');
    }
};

