<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id',
        'client_id',
        'deal_id',
        'rating',
        'comment',
        'response',
        'responded_at',
        'is_verified',
        'status',
    ];

    protected $casts = [
        'rating' => 'integer',
        'is_verified' => 'boolean',
        'responded_at' => 'datetime',
    ];

    // Relationships

    public function company(): BelongsTo
    {
        return $this->belongsTo(CompanyProfile::class, 'company_id');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(ClientProfile::class, 'client_id');
    }

    public function deal(): BelongsTo
    {
        return $this->belongsTo(Deal::class);
    }

    // Scopes

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function scopeForCompany($query, $companyId)
    {
        return $query->where('company_id', $companyId);
    }

    public function scopeByClient($query, $clientId)
    {
        return $query->where('client_id', $clientId);
    }

    public function scopeWithRating($query, $rating)
    {
        return $query->where('rating', $rating);
    }

    // Methods

    public function respond(string $response): void
    {
        $this->update([
            'response' => $response,
            'responded_at' => now(),
        ]);
    }

    public function approve(): void
    {
        $this->update(['status' => 'approved']);
    }

    public function reject(): void
    {
        $this->update(['status' => 'rejected']);
    }

    public function hide(): void
    {
        $this->update(['status' => 'hidden']);
    }

    // Static methods

    public static function getAverageForCompany(int $companyId): float
    {
        return static::forCompany($companyId)
            ->approved()
            ->avg('rating') ?? 0;
    }

    public static function getCountForCompany(int $companyId): int
    {
        return static::forCompany($companyId)
            ->approved()
            ->count();
    }

    public static function getRatingDistribution(int $companyId): array
    {
        $distribution = [];
        for ($i = 1; $i <= 5; $i++) {
            $distribution[$i] = static::forCompany($companyId)
                ->approved()
                ->where('rating', $i)
                ->count();
        }
        return $distribution;
    }
}
