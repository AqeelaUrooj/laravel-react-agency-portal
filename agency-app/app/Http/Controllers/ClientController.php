<?php

namespace App\Http\Controllers;

use App\Http\Requests\ClientRequest;
use App\Models\Client;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate(['search' => ['nullable', 'string', 'max:255'], 'status' => ['nullable', 'in:active,inactive,lead'], 'page' => ['nullable', 'integer', 'min:1']]);
        $query = $request->user()->clients();
        if ($search = $filters['search'] ?? null) {
            $query->where(function ($query) use ($search): void {
                $query->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%")->orWhere('company', 'like', "%{$search}%")->orWhere('phone', 'like', "%{$search}%");
            });
        }
        if ($status = $filters['status'] ?? null) {
            $query->where('status', $status);
        }

        return Inertia::render('clients/index', ['clients' => $query->latest('id')->paginate(10)->withQueryString(), 'metrics' => Client::metrics($request->user()), 'filters' => ['search' => $filters['search'] ?? '', 'status' => $filters['status'] ?? '']]);
    }

    public function create(): Response
    {
        return Inertia::render('clients/create');
    }

    public function store(ClientRequest $request): RedirectResponse
    {
        $client = $request->user()->clients()->create($request->validated());

        return to_route('clients.show', $client)->with('success', 'Client added successfully.');
    }

    private function owned(Request $request, Client $client): void
    {
        abort_unless($client->user_id === $request->user()->id, 404);
    }

    public function show(Request $request, Client $client): Response
    {
        $this->owned($request, $client);

        return Inertia::render('clients/show', ['client' => $client, 'projects' => $client->projects()->latest()->paginate(5)->withQueryString()]);
    }

    public function edit(Request $request, Client $client): Response
    {
        $this->owned($request, $client);

        return Inertia::render('clients/edit', ['client' => $client]);
    }

    public function update(ClientRequest $request, Client $client): RedirectResponse
    {
        $this->owned($request, $client);
        $client->update($request->validated());

        return to_route('clients.show', $client)->with('success', 'Client updated successfully.');
    }

    public function destroy(Request $request, Client $client): RedirectResponse
    {
        $this->owned($request, $client);
        if ($client->projects()->exists()) {
            return back()->withErrors(['client' => 'Delete or reassign this client’s projects before deleting the client.']);
        }
        $client->delete();

        return to_route('clients.index')->with('success', 'Client deleted successfully.');
    }
}
