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
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('usuario', 100);
            $table->string('nome_usuario', 255);
            $table->string('acao', 50);
            $table->string('entidade', 50);
            $table->string('descricao', 500);
            $table->json('detalhes')->nullable();
            $table->string('ip', 45);
            $table->text('user_agent')->nullable();
            $table->timestamp('timestamp');
            $table->timestamps();

            $table->index(['usuario', 'timestamp']);
            $table->index(['acao', 'entidade']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};

