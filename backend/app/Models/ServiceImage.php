<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class ServiceImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_id',
        'path',
        'filename',
        'original_name',
        'mime_type',
        'size',
        'caption',
        'is_cover',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'is_cover' => 'boolean',
            'order' => 'integer',
            'size' => 'integer',
        ];
    }

    protected $appends = ['url'];

    // ==========================================
    // RELATIONSHIPS
    // ==========================================

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    // ==========================================
    // ACCESSORS
    // ==========================================

    public function getUrlAttribute(): string
    {
        return Storage::url($this->path);
    }

    // ==========================================
    // SCOPES
    // ==========================================

    public function scopeCover($query)
    {
        return $query->where('is_cover', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order')->orderBy('id');
    }

    // ==========================================
    // HELPERS
    // ==========================================

    public function deleteFile(): bool
    {
        if ($this->path && Storage::exists($this->path)) {
            return Storage::delete($this->path);
        }
        return false;
    }

    public static function boot()
    {
        parent::boot();

        static::deleting(function ($image) {
            $image->deleteFile();
        });
    }
}
