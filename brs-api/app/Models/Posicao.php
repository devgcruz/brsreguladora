<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Posicao extends Model
{
    protected $table = 'posicoes';
    protected $fillable = ['nome'];
}
