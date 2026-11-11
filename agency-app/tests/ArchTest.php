<?php

use Illuminate\Support\Facades\DB;

arch()->preset()->laravel();

arch('controllers stay thin')
    ->expect('App\Http\Controllers')
    ->not->toUse(DB::class);
