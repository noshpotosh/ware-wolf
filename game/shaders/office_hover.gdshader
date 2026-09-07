shader_type canvas_item;

uniform sampler2D art : filter_nearest, repeat_disable;
uniform vec4 sprite_rect;
uniform vec4 source_rect;
uniform vec2 flip = vec2(1.0);
uniform vec4 outline_color : source_color = vec4(1.0, 0.68, 0.25, 1.0);
const int OUTLINE_RADIUS = 2;
varying vec2 local_pixel;
varying vec4 tint;

void vertex() {
	vec2 center = sprite_rect.xy + sprite_rect.zw * 0.5;
	VERTEX += sign(VERTEX - center) * float(OUTLINE_RADIUS);
	local_pixel = VERTEX - sprite_rect.xy;
	tint = COLOR;
}

vec4 artwork(vec2 pixel) {
	vec2 uv = pixel / sprite_rect.zw;
	if (any(lessThan(uv, vec2(0.0))) ||
			any(greaterThanEqual(uv, vec2(1.0)))) {
		return vec4(0.0);
	}
	uv = (uv - 0.5) * flip + 0.5;
	vec2 texture_pixel = source_rect.xy + uv * source_rect.zw;
	return texture(art, texture_pixel / vec2(textureSize(art, 0)));
}

void fragment() {
	vec4 original = artwork(local_pixel);
	float nearby_alpha = 0.0;
	for (int y = -OUTLINE_RADIUS; y <= OUTLINE_RADIUS; y++) {
		for (int x = -OUTLINE_RADIUS; x <= OUTLINE_RADIUS; x++) {
			vec2 offset = vec2(float(x), float(y));
			nearby_alpha = max(nearby_alpha,
				artwork(local_pixel + offset).a);
		}
	}
	float border_alpha = nearby_alpha * (1.0 - original.a);
	float alpha = original.a + border_alpha;
	vec3 color = original.rgb * original.a;
	color += outline_color.rgb * border_alpha;
	COLOR = vec4(color / max(alpha, 0.0001), alpha) * tint;
}
