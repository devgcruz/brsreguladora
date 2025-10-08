<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Seguradora extends Model
{
    protected $table = 'seguradoras';
    protected $fillable = ['nome'];
}
