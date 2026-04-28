<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Ranking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'score',
        'cycle',
        'deals_completed',
        'total_value',
        'position',
        'previous_position',
        'breakdown',
    ];

    protected function casts(): array
    {
        return [
            'score' => 'decimal:2',
            'total_value' => 'decimal:2',
            'deals_completed' => 'integer',
            'position' => 'integer',
            'previous_position' => 'integer',
            'breakdown' => 'array',
        ];
    }

    // ==========================================
    // RELATIONSHIPS
    // ==========================================

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ==========================================
    // SCOPES
    // ==========================================

    public function scopeForCycle($query, string $cycle)
    {
        return $query->where('cycle', $cycle);
    }

    public function scopeCurrentCycle($query)
    {
        return $query->where('cycle', self::getCurrentCycle());
    }

    public function scopeOrdered($query)
    {
        return $query->orderByDesc('score');
    }

    // ==========================================
    // STATIC HELPERS
    // ==========================================

    public static function getCurrentCycle(): string
    {
        $now = Carbon::now();
        $semester = $now->month <= 6 ? 'S1' : 'S2';
        return $now->year . '-' . $semester;
    }

    public static function getOrCreateForUser(User $user, ?string $cycle = null): self
    {
        $cycle = $cycle ?? self::getCurrentCycle();

        return self::firstOrCreate(
            ['user_id' => $user->id, 'cycle' => $cycle],
            ['score' => 0, 'deals_completed' => 0, 'total_value' => 0]
        );
    }

    // ==========================================
    // HELPERS
    // ==========================================

    public function addScore(float $points, string $reason = ''): void
    {
        $breakdown = $this->breakdown ?? [];
        $breakdown[] = [
            'points' => $points,
            'reason' => $reason,
            'date' => now()->toIso8601String(),
        ];

        $this->update([
            'score' => $this->score + $points,
            'breakdown' => $breakdown,
        ]);
    }

    public function incrementDeals(float $value): void
    {
        $this->update([
            'deals_completed' => $this->deals_completed + 1,
            'total_value' => $this->total_value + $value,
        ]);
    }

    public static function recalculatePositions(string $cycle): void
    {
        $rankings = self::forCycle($cycle)
            ->orderByDesc('score')
            ->get();

        $position = 1;
        foreach ($rankings as $ranking) {
            // Save previous position before updating
            $ranking->update([
                'previous_position' => $ranking->position,
                'position' => $position,
            ]);
            $position++;
        }
    }
}
