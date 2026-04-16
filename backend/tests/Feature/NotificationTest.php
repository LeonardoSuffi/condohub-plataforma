<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Notification;

class NotificationTest extends TestCase
{
    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = $this->createCliente(['email' => 'notifuser@test.com']);
    }

    /** @test */
    public function user_can_list_own_notifications()
    {
        Notification::create([
            'user_id' => $this->user->id,
            'type' => 'system',
            'title' => 'Test Notification',
            'message' => 'This is a test',
        ]);

        $response = $this->actingAs($this->user)->getJson('/api/notifications');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'notifications',
                    'unread_count',
                ],
            ]);
    }

    /** @test */
    public function user_can_get_unread_count()
    {
        // Create 3 unread notifications
        for ($i = 0; $i < 3; $i++) {
            Notification::create([
                'user_id' => $this->user->id,
                'type' => 'system',
                'title' => "Notification $i",
                'message' => 'Test',
            ]);
        }

        // Create 1 read notification
        Notification::create([
            'user_id' => $this->user->id,
            'type' => 'system',
            'title' => 'Read Notification',
            'message' => 'Test',
            'read_at' => now(),
        ]);

        $response = $this->actingAs($this->user)->getJson('/api/notifications/unread-count');

        $response->assertStatus(200)
            ->assertJsonPath('data.count', 3);
    }

    /** @test */
    public function user_can_mark_notification_as_read()
    {
        $notification = Notification::create([
            'user_id' => $this->user->id,
            'type' => 'system',
            'title' => 'Unread',
            'message' => 'Test',
        ]);

        $response = $this->actingAs($this->user)->patchJson("/api/notifications/{$notification->id}/read");

        $response->assertStatus(200);

        $this->assertNotNull($notification->fresh()->read_at);
    }

    /** @test */
    public function user_can_mark_all_notifications_as_read()
    {
        for ($i = 0; $i < 5; $i++) {
            Notification::create([
                'user_id' => $this->user->id,
                'type' => 'system',
                'title' => "Notification $i",
                'message' => 'Test',
            ]);
        }

        $response = $this->actingAs($this->user)->postJson('/api/notifications/mark-all-read');

        $response->assertStatus(200);

        $unreadCount = Notification::where('user_id', $this->user->id)
            ->whereNull('read_at')
            ->count();

        $this->assertEquals(0, $unreadCount);
    }

    /** @test */
    public function user_can_delete_notification()
    {
        $notification = Notification::create([
            'user_id' => $this->user->id,
            'type' => 'system',
            'title' => 'To Delete',
            'message' => 'Test',
        ]);

        $response = $this->actingAs($this->user)->deleteJson("/api/notifications/{$notification->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('notifications', ['id' => $notification->id]);
    }

    /** @test */
    public function user_cannot_see_others_notifications()
    {
        $otherUser = $this->createCliente(['email' => 'other@test.com']);

        $notification = Notification::create([
            'user_id' => $otherUser->id,
            'type' => 'system',
            'title' => 'Private',
            'message' => 'Test',
        ]);

        $response = $this->actingAs($this->user)->patchJson("/api/notifications/{$notification->id}/read");

        $response->assertStatus(404);
    }

    /** @test */
    public function user_cannot_delete_others_notifications()
    {
        $otherUser = $this->createCliente(['email' => 'another@test.com']);

        $notification = Notification::create([
            'user_id' => $otherUser->id,
            'type' => 'system',
            'title' => 'Private',
            'message' => 'Test',
        ]);

        $response = $this->actingAs($this->user)->deleteJson("/api/notifications/{$notification->id}");

        $response->assertStatus(404);
    }
}
