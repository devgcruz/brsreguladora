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
            $table->date('data_recibo')->nullable()->after('DATA_PAGAMENTO_NOTA_FISCAL');
            $table->string('status_nota_fiscal')->nullable()->after('data_recibo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tab_financeiro', function (Blueprint $table) {
            $table->dropColumn('data_recibo');
            $table->dropColumn('status_nota_fiscal');
        });
    }
};
