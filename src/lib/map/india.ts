/**
 * Chart primitives for the destination survey map.
 *
 * Deliberately not a mapping library. Everything here is a few dozen lines of
 * arithmetic over one pre-simplified boundary ring, because the survey chart
 * needs exactly three things — project a coordinate, frame a set of
 * coordinates, and merge coordinates that would otherwise land on top of each
 * other — and none of those are worth 200kB of tiles and a projection engine.
 *
 * The clustering is the part that matters. The catalogue currently covers six
 * well-separated regions, but the roadmap is dense: a dozen Uttarakhand towns,
 * another dozen across Himachal, Kashmir and Ladakh. Plotted raw at country
 * scale those become one illegible smudge in the top-left. So markers that
 * fall within `minDist` of each other on screen collapse into a single counted
 * pin, and opening that pin re-frames the chart on just those waypoints, where
 * they are far enough apart to separate again. Density is handled by geometry
 * rather than by curating which destinations are allowed on the map.
 */

/* ── Projection ──
   Equirectangular with a fixed longitude compression at India's mid-latitude.
   Plain equirect makes the country read about 8% too wide; one cosine term
   fixes the silhouette without pulling in a real projection. */
const MID_LAT = 23;
const LNG_SCALE = Math.cos((MID_LAT * Math.PI) / 180);

/** Longitude → map units. */
export const toMapX = (lng: number) => lng * LNG_SCALE;
/** Latitude → map units. Y is flipped so north is up in screen space. */
export const toMapY = (lat: number) => -lat;
/** Map units → longitude. Used for the graticule labels. */
export const toLng = (mx: number) => mx / LNG_SCALE;

export interface Box {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/** The visible window in map units. */
export interface ViewRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A pixel rect inside the chart that framed content must land in. */
export interface SafeArea {
  x: number;
  y: number;
  w: number;
  h: number;
}

/* ── The outline ──
   The Survey-of-India-aligned national boundary, taken from the datameet
   `india-composite` dataset (the Indian official composite, so Jammu &
   Kashmir and Ladakh render on the Indian claim line rather than a foreign
   publisher's). The source ring is 242,145 vertices; this is that ring run
   through Douglas–Peucker at a ~6 km tolerance, which is roughly one pixel at
   the size the chart is drawn and leaves a simple, non-self-intersecting ring.

   Islands are excluded. The Andamans sit 1,200 km east of the mainland and
   Lakshadweep 400 km west; including either would force the country small
   enough to fit an expanse of empty ocean no waypoint occupies. */
export const INDIA_OUTLINE: readonly (readonly [number, number])[] = [
  [77.5187, 35.4857], [77.8146, 35.5223], [77.911, 35.4621], [77.9378, 35.5593], [78.1572, 35.5509],
  [78.2436, 35.7253], [78.8002, 35.8698], [78.8559, 35.9742], [79.0284, 35.9142], [79.3434, 35.9879],
  [79.4889, 35.8492], [79.5721, 35.8965], [79.7043, 35.639], [79.9989, 35.6024], [80.0549, 35.4234],
  [80.2054, 35.5752], [80.4116, 35.4771], [80.2859, 35.3543], [80.2051, 34.8912], [80.0741, 34.7058],
  [79.7865, 34.6274], [79.7943, 34.4801], [79.5089, 34.4537], [79.6074, 34.2382], [79.4906, 34.1909],
  [79.4033, 34.0023], [78.9952, 34.0368], [78.8872, 33.9726], [79.0904, 33.6372], [78.9074, 33.6205],
  [78.9401, 33.38], [79.1074, 33.1998], [79.4083, 33.1888], [79.3315, 33.0008], [79.5484, 32.6766],
  [79.4133, 32.52], [79.276, 32.556], [78.9683, 32.3357], [78.7794, 32.479], [78.7396, 32.6957],
  [78.395, 32.5299], [78.4884, 32.2756], [78.7796, 31.9936], [78.7023, 31.8066], [78.8466, 31.6092],
  [78.7205, 31.5089], [78.7782, 31.3123], [78.8995, 31.2897], [79.0991, 31.4547], [79.4275, 31.0229],
  [79.6031, 30.9399], [79.866, 30.9718], [80.2386, 30.7623], [80.2183, 30.5801], [81.0309, 30.2471],
  [80.3657, 29.7479], [80.4079, 29.5955], [80.2429, 29.4439], [80.2972, 29.2052], [80.1448, 29.1043],
  [80.0752, 28.8245], [80.517, 28.5518], [80.5685, 28.688], [81.2106, 28.3608], [81.3179, 28.1337],
  [81.4466, 28.1611], [81.8849, 27.857], [82.07, 27.9237], [82.4487, 27.6793], [82.7079, 27.7228],
  [82.7356, 27.5023], [83.1879, 27.4544], [83.3173, 27.33], [83.3881, 27.4798], [83.8637, 27.3459],
  [83.8474, 27.4454], [84.1507, 27.5169], [84.2917, 27.3851], [84.62, 27.3388], [84.689, 27.2206],
  [84.6433, 27.0462], [84.9625, 26.9605], [85.024, 26.8544], [85.1907, 26.87], [85.2115, 26.7583],
  [85.627, 26.8735], [85.8516, 26.568], [86.0269, 26.6668], [86.3331, 26.6191], [86.7306, 26.4226],
  [87.0716, 26.5858], [87.0915, 26.4504], [87.3406, 26.3474], [87.4658, 26.4404], [87.6046, 26.3809],
  [87.8881, 26.4869], [88.0084, 26.3613], [88.1863, 26.7385], [88.1353, 26.9851], [87.9873, 27.1194],
  [88.0437, 27.4959], [88.197, 27.791], [88.118, 27.9181], [88.6373, 28.1182], [88.8361, 28.0153],
  [88.8881, 27.8564], [88.7633, 27.5664], [88.9147, 27.2907], [88.7456, 27.142], [88.8716, 27.1088],
  [88.8753, 26.9432], [88.9213, 26.9942], [89.1336, 26.8075], [89.3789, 26.8623], [89.8609, 26.702],
  [90.1939, 26.7735], [90.3555, 26.9008], [90.7172, 26.7699], [91.6897, 26.8067], [91.8924, 26.9206],
  [92.0564, 26.8473], [92.1213, 26.9607], [92.0377, 27.2585], [92.1233, 27.2866], [92.0167, 27.4806],
  [91.652, 27.4833], [91.5623, 27.6314], [91.643, 27.7611], [91.9244, 27.7165], [92.2437, 27.8882],
  [92.4558, 27.7933], [92.7296, 27.9782], [92.6773, 28.151], [92.9216, 28.2007], [93.4256, 28.662],
  [93.7122, 28.6647], [94.2605, 28.9317], [94.3664, 29.0259], [94.2932, 29.1523], [94.6265, 29.2958],
  [94.6972, 29.3154], [94.8073, 29.1649], [95.2626, 29.0683], [95.4339, 29.1927], [95.5036, 29.126],
  [95.6056, 29.236], [95.7088, 29.204], [95.8123, 29.3475], [96.0537, 29.3827], [96.3028, 29.1923],
  [96.1868, 29.0373], [96.3302, 29.1131], [96.6318, 28.7337], [96.4065, 28.5059], [96.4981, 28.429],
  [96.4931, 28.5418], [96.7119, 28.6114], [96.9251, 28.3526], [97.1264, 28.3619], [97.3601, 28.2048],
  [97.3123, 28.0621], [97.3954, 28.0117], [97.3662, 27.8772], [97.2475, 27.9001], [96.8898, 27.6059],
  [97.1382, 27.0915], [96.8677, 27.1847], [96.8843, 27.2602], [96.7042, 27.3723], [96.2286, 27.2788],
  [95.4306, 26.7], [95.1491, 26.616], [95.0617, 26.4495], [95.1857, 26.0733], [95.0116, 25.898],
  [95.0487, 25.7598], [94.8982, 25.5656], [94.6347, 25.3952], [94.5756, 25.2139], [94.7409, 25.1266],
  [94.7136, 24.935], [94.3982, 24.4823], [94.1566, 23.8479], [93.7543, 24.0055], [93.5051, 23.9425],
  [93.3285, 24.081], [93.4377, 23.6868], [93.3853, 23.1347], [93.2936, 23.0067], [93.1265, 23.044],
  [93.1064, 22.5269], [93.202, 22.2641], [93.1507, 22.1763], [93.0378, 22.1954], [93.0051, 21.9872],
  [92.9512, 22.03], [92.9062, 21.9414], [92.6995, 22.155], [92.6025, 21.9781], [92.28, 23.7194],
  [92.2147, 23.6521], [92.1483, 23.7356], [92.0471, 23.6458], [91.957, 23.7341], [91.9703, 23.4783],
  [91.762, 23.3001], [91.8357, 23.0924], [91.6186, 22.9373], [91.4542, 23.2604], [91.3807, 23.2086],
  [91.4172, 23.0647], [91.347, 23.1024], [91.3201, 23.3602], [91.1596, 23.6106], [91.2328, 23.9272],
  [91.3793, 23.9754], [91.3745, 24.1075], [91.5861, 24.0727], [91.6659, 24.2335], [91.7626, 24.1418],
  [91.7448, 24.2474], [91.9016, 24.1366], [91.9199, 24.3371], [92.164, 24.4186], [92.2964, 24.7367],
  [92.2318, 24.9003], [92.498, 24.8765], [92.4254, 25.0303], [92.0617, 25.1878], [91.6378, 25.1227],
  [91.2679, 25.2073], [90.4409, 25.1446], [89.8383, 25.2932], [89.8165, 25.8155], [89.8869, 25.9453],
  [89.6793, 26.2383], [89.5774, 25.9691], [89.3564, 26.0077], [89.1553, 26.1383], [89.0874, 26.3977],
  [88.9565, 26.4597], [88.9047, 26.4086], [89.0507, 26.2417], [88.8983, 26.2888], [88.8415, 26.2309],
  [88.7934, 26.3101], [88.6662, 26.2628], [88.7454, 26.3479], [88.3995, 26.6266], [88.3316, 26.4819],
  [88.4851, 26.4604], [88.5242, 26.3594], [88.177, 26.148], [88.1069, 25.8151], [88.2694, 25.8083],
  [88.5399, 25.5084], [88.8105, 25.5233], [88.8409, 25.3639], [89.0084, 25.2644], [88.923, 25.1651],
  [88.4417, 25.2105], [88.399, 24.9452], [88.3303, 24.8702], [88.1379, 24.9363], [88.175, 24.8602],
  [88.0086, 24.6678], [88.3339, 24.3815], [88.7354, 24.2791], [88.7694, 23.9821], [88.5755, 23.8618],
  [88.5583, 23.6492], [88.8008, 23.4973], [88.7188, 23.2551], [88.9958, 23.215], [88.8449, 23.0092],
  [88.9685, 22.845], [88.9376, 22.5601], [89.098, 22.1551], [88.9857, 21.8956], [89.0996, 21.6373],
  [88.92, 21.6304], [88.86, 21.7771], [88.8491, 21.6162], [88.7225, 21.6779], [88.7786, 22.0141],
  [88.6391, 22.0762], [88.555, 21.8154], [88.5183, 21.9479], [88.4579, 21.8958], [88.4509, 21.6121],
  [88.4242, 21.7188], [88.3966, 21.5912], [88.4021, 21.72], [88.2749, 21.7337], [88.3096, 21.5792],
  [88.2466, 21.5612], [88.1562, 21.9558], [88.2087, 22.1491], [88.0196, 22.2229], [88.1903, 22.1041],
  [87.8042, 21.6962], [87.0925, 21.5371], [86.9121, 21.3383], [86.8271, 21.1366], [86.9746, 20.8208],
  [86.8676, 20.7752], [87.0696, 20.7208], [86.7316, 20.5346], [86.7079, 20.4091], [86.7879, 20.3766],
  [86.6738, 20.2941], [86.7988, 20.3467], [86.5209, 20.1846], [86.4225, 20.0021], [86.315, 19.9879],
  [86.3716, 19.9521], [85.54, 19.6962], [85.0379, 19.3917], [84.1292, 18.3096], [83.5563, 18.0258],
  [83.2149, 17.5904], [82.6017, 17.2838], [82.3062, 17.0383], [82.2508, 16.8754], [82.3333, 16.9888],
  [82.3712, 16.9091], [82.2689, 16.7067], [82.3686, 16.713], [82.3089, 16.5975], [82.2582, 16.6887],
  [82.3046, 16.5599], [81.71, 16.3054], [81.5533, 16.3721], [81.2675, 16.2929], [81.1521, 15.9717],
  [80.9383, 15.7104], [80.8316, 15.7013], [80.8054, 15.8425], [80.6775, 15.8896], [80.2642, 15.6721],
  [80.0479, 15.0741], [80.1958, 14.5779], [80.1262, 14.0658], [80.3462, 13.2833], [80.1563, 12.4624],
  [79.8729, 12.04], [79.7588, 11.6716], [79.8812, 10.3108], [79.7933, 10.2729], [79.6391, 10.3654],
  [79.2941, 10.2604], [79.2679, 10.04], [78.9004, 9.4867], [78.9592, 9.3404], [79.1891, 9.2804],
  [78.8609, 9.2513], [78.2658, 9.0179], [78.1254, 8.7617], [78.2004, 8.7642], [78.07, 8.3737],
  [77.55, 8.0737], [77.3167, 8.1229], [77.0125, 8.3504], [76.5462, 8.9], [76.6663, 8.9942],
  [76.5387, 8.9341], [76.3571, 9.365], [76.2704, 10.0325], [76.2196, 9.9991], [76.2083, 10.1954],
  [75.9121, 10.7849], [75.8696, 11.1241], [75.5429, 11.7108], [75.2012, 12.0041], [74.8254, 12.8383],
  [74.6954, 13.3433], [74.7221, 13.6383], [74.4271, 14.275], [74.5171, 14.2416], [74.422, 14.2858],
  [74.2837, 14.7125], [74.1175, 14.7712], [74.1647, 14.8586], [73.9129, 15.0833], [73.8979, 15.3283],
  [73.7846, 15.4083], [73.8852, 15.4276], [73.7338, 15.5883], [73.7896, 15.6524], [73.7337, 15.6149],
  [73.4571, 16.0533], [73.3671, 16.3792], [73.4688, 16.4133], [73.37, 16.3946], [73.3171, 16.5108],
  [73.4437, 16.5], [73.3187, 16.5983], [73.4021, 16.6158], [73.3071, 16.7283], [73.3304, 16.9675],
  [73.2571, 17.0475], [73.3254, 17.04], [73.1912, 17.2966], [73.2996, 17.2916], [73.1721, 17.3992],
  [73.1396, 17.5575], [73.2166, 17.5888], [73.1379, 17.61], [73.1296, 17.8342], [73.0313, 17.9492],
  [73.0909, 17.9904], [73.0196, 17.9908], [72.9329, 18.2175], [72.9667, 18.2787], [73.1021, 18.1424],
  [73.0862, 18.3192], [73.03, 18.2629], [72.9212, 18.3475], [72.9071, 18.5399], [73.0062, 18.4667],
  [72.8571, 18.6942], [72.9392, 18.8254], [73.0163, 18.715], [72.9088, 18.8974], [73.0671, 19.0208],
  [73.0012, 19.0041], [72.9858, 19.1895], [72.8062, 18.8933], [72.7862, 19.305], [72.9121, 19.2883],
  [72.7446, 19.4599], [72.8888, 19.5241], [72.7304, 19.5292], [72.6554, 19.8333], [72.6658, 19.9337],
  [72.7463, 19.9416], [72.7538, 20.29], [72.9004, 20.53], [72.845, 20.7437], [72.9304, 20.7591],
  [72.8262, 20.7941], [72.7829, 20.9192], [72.8496, 20.9716], [72.7583, 20.9288], [72.7337, 20.9983],
  [72.7283, 21.0537], [72.8487, 21.0325], [72.707, 21.0875], [72.7887, 21.18], [72.64, 21.0804],
  [72.6379, 21.2066], [72.7417, 21.1979], [72.5979, 21.2983], [72.7624, 21.4479], [72.6458, 21.4462],
  [72.6796, 21.5008], [72.9279, 21.6758], [72.5367, 21.6629], [72.6187, 21.9059], [72.7496, 21.9733],
  [72.5375, 21.8962], [72.5079, 21.9758], [72.5858, 22.2046], [72.7608, 22.1737], [72.9121, 22.265],
  [72.535, 22.3054], [72.4308, 22.2045], [72.38, 22.3371], [72.3262, 22.3083], [72.2987, 22.1033],
  [72.182, 22.0225], [72.2471, 21.9242], [72.1633, 21.9596], [72.2495, 21.9108], [72.2496, 21.81],
  [72.1662, 21.81], [72.3063, 21.6267], [72.0892, 21.3154], [72.1113, 21.1991], [71.4425, 20.8679],
  [70.8221, 20.6908], [70.1558, 21.0546], [68.9354, 22.3067], [69.0683, 22.4787], [69.0354, 22.39],
  [69.1921, 22.4183], [69.2275, 22.2562], [69.48, 22.3321], [69.51, 22.4254], [69.6679, 22.3233],
  [69.7284, 22.4746], [69.8083, 22.3979], [69.9858, 22.5446], [70.1742, 22.542], [70.4475, 22.9704],
  [70.2875, 22.9446], [70.2191, 23.0554], [70.2241, 22.9529], [70.1317, 22.9959], [70.1, 22.9079],
  [69.885, 22.9129], [69.7108, 22.7379], [69.4516, 22.7754], [69.3617, 22.8812], [69.35, 22.8179],
  [69.1958, 22.8362], [68.6316, 23.1687], [68.7211, 23.1341], [68.5795, 23.2274], [68.6795, 23.3016],
  [68.4487, 23.48], [68.4691, 23.5513], [68.4254, 23.5092], [68.5478, 23.7142], [68.8108, 23.8788],
  [68.5141, 23.7454], [68.4341, 23.7363], [68.4268, 23.8194], [68.35, 23.5821], [68.172, 23.6167],
  [68.3496, 23.73], [68.2458, 23.6712], [68.1896, 23.7292], [68.357, 23.9742], [68.753, 23.9714],
  [68.808, 24.3135], [68.866, 24.2122], [68.9454, 24.3025], [69.0034, 24.2231], [69.5943, 24.2924],
  [69.7315, 24.171], [70.025, 24.171], [70.1099, 24.295], [70.5613, 24.4209], [70.5713, 24.2518],
  [70.714, 24.2157], [71.1196, 24.4025], [70.9985, 24.4444], [70.9863, 24.5956], [71.0962, 24.6886],
  [70.8885, 25.1481], [70.6648, 25.3969], [70.6601, 25.702], [70.2686, 25.7136], [70.0998, 25.9382],
  [70.1743, 26.5513], [69.8232, 26.589], [69.5103, 26.7435], [69.5868, 27.1833], [70.0259, 27.5629],
  [70.1326, 27.806], [70.3722, 28.0118], [70.5895, 28.0105], [70.7398, 27.7419], [70.872, 27.7055],
  [71.8983, 27.9612], [71.9273, 28.1217], [72.2066, 28.3948], [72.3903, 28.7697], [72.9458, 29.0278],
  [73.2823, 29.5721], [73.397, 29.9459], [73.9727, 30.1983], [73.8798, 30.3598], [73.9347, 30.4902],
  [74.0723, 30.5229], [74.4165, 30.9403], [74.6961, 31.074], [74.5104, 31.132], [74.5517, 31.3644],
  [74.6547, 31.4259], [74.4866, 31.7151], [74.6074, 31.8901], [74.8794, 32.0538], [75.2403, 32.091],
  [75.3723, 32.2258], [75.1017, 32.4775], [74.6814, 32.4928], [74.7053, 32.842], [74.6376, 32.7515],
  [74.3718, 32.7696], [73.9258, 33.0341], [73.6341, 33.0934], [73.5946, 33.8916], [73.3984, 34.3783],
  [73.4533, 34.5693], [73.6567, 34.5625], [73.728, 34.7643], [74.0451, 34.8904], [74.1319, 35.1193],
  [73.7499, 35.2209], [73.6929, 35.3492], [73.7856, 35.5245], [73.4053, 35.5293], [73.331, 35.6629],
  [73.126, 35.7212], [73.1783, 35.8602], [72.5685, 35.8518], [72.5491, 36.2327], [72.9674, 36.4769],
  [73.0619, 36.6974], [73.4089, 36.7586], [73.8343, 36.7098], [73.839, 36.8013], [73.6506, 36.9158],
  [74.0407, 36.8343], [74.424, 37.0069], [74.5628, 36.9713], [74.7042, 37.0976], [74.8407, 37.0656],
  [74.9021, 36.9406], [75.1457, 37.0343], [75.4063, 36.9655], [75.4601, 36.7298], [75.7356, 36.7531],
  [76.0279, 36.4396], [76.7188, 36.1599], [76.8391, 35.8595], [77.3486, 35.7198],
];

/** The outline pre-projected, so the render path is pure arithmetic. */
export const INDIA_POINTS: readonly (readonly [number, number])[] =
  INDIA_OUTLINE.map(([lng, lat]) => [toMapX(lng), toMapY(lat)] as const);

export const INDIA_BOX: Box = INDIA_POINTS.reduce<Box>(
  (box, [x, y]) => ({
    minX: Math.min(box.minX, x),
    minY: Math.min(box.minY, y),
    maxX: Math.max(box.maxX, x),
    maxY: Math.max(box.maxY, y),
  }),
  { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
);

/** Bounding box of an arbitrary set of already-projected points. */
export function boxOf(points: { x: number; y: number }[]): Box {
  return points.reduce<Box>(
    (box, p) => ({
      minX: Math.min(box.minX, p.x),
      minY: Math.min(box.minY, p.y),
      maxX: Math.max(box.maxX, p.x),
      maxY: Math.max(box.maxY, p.y),
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  );
}

/**
 * Grow a box outwards. `min` matters for the single-waypoint case, where the
 * box has zero extent and a purely proportional pad would leave it at zero.
 */
export function padBox(box: Box, frac = 0.18, min = 0.5): Box {
  const px = Math.max((box.maxX - box.minX) * frac, min);
  const py = Math.max((box.maxY - box.minY) * frac, min);
  return {
    minX: box.minX - px,
    minY: box.minY - py,
    maxX: box.maxX + px,
    maxY: box.maxY + py,
  };
}

/**
 * Frame `box` so it lands inside `safe` — a rect that on wide viewports stops
 * short of the floating detail card, which is why this takes a safe area
 * rather than just centring in the chart. Returns the window covering the
 * whole chart, so the outline still bleeds behind the card instead of stopping
 * at an invisible edge.
 */
export function fitView(
  box: Box,
  chart: { w: number; h: number },
  safe: SafeArea,
  maxScale = Infinity,
  /**
   * Where inside the safe area the framed content is centred, 0–1. The chart
   * sits left of centre on wide viewports — dead-centring it inside a safe
   * area that already stops short of the card leaves a conspicuous gutter on
   * the left, because the height constraint binds first and the extra width
   * gets split evenly instead of being spent where it is needed.
   */
  anchor: { x: number; y: number } = { x: 0.5, y: 0.5 }
): ViewRect {
  const bw = Math.max(box.maxX - box.minX, 1e-6);
  const bh = Math.max(box.maxY - box.minY, 1e-6);
  const scale = Math.min(safe.w / bw, safe.h / bh, maxScale);

  const cx = (box.minX + box.maxX) / 2;
  const cy = (box.minY + box.maxY) / 2;

  /* The anchor is a preference, not a mandate. It can only shift the content
     by however much slack the safe area actually has — at a narrow container
     the framed box nearly fills it, and an un-clamped bias would push the
     west coast off the chart. With no slack this collapses to centring. */
  const slackX = Math.max(0, (safe.w - bw * scale) / 2) / safe.w;
  const slackY = Math.max(0, (safe.h - bh * scale) / 2) / safe.h;
  const ax = clamp(anchor.x, 0.5 - slackX, 0.5 + slackX);
  const ay = clamp(anchor.y, 0.5 - slackY, 0.5 + slackY);

  return {
    x: cx - (safe.x + safe.w * ax) / scale,
    y: cy - (safe.y + safe.h * ay) / scale,
    w: chart.w / scale,
    h: chart.h / scale,
  };
}

const clamp = (value: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, value));

/**
 * Graticule interval that keeps roughly `target` lines across a span, snapped
 * to intervals a chart would actually print rather than whatever the division
 * produces.
 */
export function niceStep(span: number, target = 6): number {
  const raw = span / target;
  const steps = [0.1, 0.25, 0.5, 1, 2, 5, 10, 15, 20];
  return steps.find((s) => s >= raw) ?? 20;
}

/** Pixels per map unit for a given window. */
export const scaleOf = (view: ViewRect, chartW: number) => chartW / view.w;

export interface Placed<T> {
  item: T;
  x: number;
  y: number;
}

export interface Group<T> {
  items: T[];
  /** Centroid, in chart pixels. */
  x: number;
  y: number;
  /** Distance to the nearest other group — drives whether a label can fit. */
  nearest: number;
}

/**
 * Merge markers that would overlap at the current zoom.
 *
 * Greedy and order-dependent, which is fine and in fact wanted: the catalogue
 * order is stable, so the same viewport always produces the same pins rather
 * than reshuffling between renders.
 */
export function groupByProximity<T>(placed: Placed<T>[], minDist: number): Group<T>[] {
  const acc: { items: T[]; x: number; y: number; sx: number; sy: number }[] = [];

  for (const p of placed) {
    const hit = acc.find((g) => Math.hypot(g.x - p.x, g.y - p.y) < minDist);
    if (hit) {
      hit.items.push(p.item);
      hit.sx += p.x;
      hit.sy += p.y;
      hit.x = hit.sx / hit.items.length;
      hit.y = hit.sy / hit.items.length;
    } else {
      acc.push({ items: [p.item], x: p.x, y: p.y, sx: p.x, sy: p.y });
    }
  }

  return acc.map((g, i) => ({
    items: g.items,
    x: g.x,
    y: g.y,
    nearest: acc.reduce(
      (best, other, j) =>
        i === j ? best : Math.min(best, Math.hypot(other.x - g.x, other.y - g.y)),
      Infinity
    ),
  }));
}

/** Build an SVG path for a projected ring under the given window. */
export function ringPath(
  points: readonly (readonly [number, number])[],
  view: ViewRect,
  scale: number
): string {
  let d = "";
  for (let i = 0; i < points.length; i++) {
    const px = (points[i][0] - view.x) * scale;
    const py = (points[i][1] - view.y) * scale;
    d += `${i === 0 ? "M" : "L"}${px.toFixed(1)} ${py.toFixed(1)}`;
  }
  return `${d}Z`;
}

/** `28.61°N` / `77.21°E`, the way a chart margin would print it. */
export const formatCoord = (value: number, positive: string, negative: string) =>
  `${Math.abs(value).toFixed(2)}°${value >= 0 ? positive : negative}`;
