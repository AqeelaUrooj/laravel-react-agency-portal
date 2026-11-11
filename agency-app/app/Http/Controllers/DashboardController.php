<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('dashboard', [
            'metrics' => Client::metrics($user),
            'projectMetrics' => Project::metrics($user),
            'recentProjects' => Project::query()->accessibleTo($user)->with('client:id,name')->latest()->limit(5)->get(),
            'recentClients' => $user->clients()->latest('id')->limit(5)->get(),
        ]);
    }
}
