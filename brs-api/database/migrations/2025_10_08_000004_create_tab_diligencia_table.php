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
        Schema::create('tab_diligencia', function (Blueprint $table) {
            $table->id('Id_Diligencia');
            $table->unsignedBigInteger('ID_JUDICIAL');
            $table->string('NUM_NF', 100)->nullable();
            $table->string('NUM_DILIGENCIA', 100)->nullable();
            $table->decimal('VALOR', 10, 2)->nullable();
            $table->date('DATA_PAGTO')->nullable();
            $table->decimal('DESPESAS', 10, 2)->nullable();
            $table->date('DATA_PAGTO_DOIS')->nullable();
            $table->timestamps();

            $table->foreign('ID_JUDICIAL')->references('Id_Judicial')->on('tab_judicial')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tab_diligencia');
    }
};

