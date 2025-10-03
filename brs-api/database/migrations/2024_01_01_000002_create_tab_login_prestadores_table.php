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
        Schema::create('tab_login_prestadores', function (Blueprint $table) {
            $table->id('ID_PRESTADOR');
            $table->unsignedBigInteger('FK_PARCEIRO');
            $table->string('NOME', 255);
            $table->string('LOGIN', 100)->unique();
            $table->string('SENHA', 255);
            $table->timestamps();

            $table->foreign('FK_PARCEIRO')->references('ID_PARCEIRO')->on('tab_cad_parceiros')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tab_login_prestadores');
    }
};

