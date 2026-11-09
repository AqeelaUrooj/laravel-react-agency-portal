<?php

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

test('email verification is disabled', function () {
    expect(Features::enabled(Features::emailVerification()))->toBeFalse();
    expect(Route::has('verification.notice'))->toBeFalse();
    expect(Route::has('verification.verify'))->toBeFalse();
    expect(Route::has('verification.send'))->toBeFalse();
});

test('unverified users can access the dashboard and profile', function () {
    $user = User::factory()->unverified()->create();
    $this->actingAs($user)->get(route('dashboard'))->assertOk();
    $this->actingAs($user)->get(route('profile.edit'))->assertOk();
});

test('registration does not send an email verification notification', function () {
    Notification::fake();
    $this->post(route('register'), [
        'name' => 'Portfolio User',
        'email' => 'portfolio@example.test',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertRedirect(route('dashboard', absolute: false));
    $user = User::where('email', 'portfolio@example.test')->firstOrFail();
    Notification::assertNotSentTo($user, VerifyEmail::class);
    $this->assertAuthenticatedAs($user);
});
