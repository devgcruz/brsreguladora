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
            $table->string('PROTOCOLO', 50)->nullable()->after('TIPO');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tab_entrada', function (Blueprint $table) {
            $table->dropColumn('PROTOCOLO');
        });
    }
};
