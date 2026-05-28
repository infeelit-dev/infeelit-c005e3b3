export const CHAPTERS = [
  {
    id: "enfance",
    icon: "🎠",
    fr: "Enfance",
    en: "Childhood",
    ar: "الطفولة",
    age_fr: "0 — 12 ans",
    age_en: "0 — 12 years",
    age_ar: "٠ — ١٢ سنة",
    tagline_fr: "Avant que le monde te façonne",
    tagline_en: "Before the world shaped you",
    tagline_ar: "قبل أن يشكّلك العالم",
    color: "#7EC8E3",
    categories: [
      {
        id: "petite_enfance",
        icon: "🧸",
        fr: "Petite Enfance",
        en: "Early Childhood",
        ar: "الطفولة المبكرة",
        questions: [
          { fr: "{name}, raconte-nous le jouet que tu n'aurais jamais voulu perdre.", en: "{name}, tell us about the toy you never wanted to lose.", ar: "{name}، احكِ لنا عن اللعبة التي لم تكن تريد أن تفقدها أبداً.", bubble_fr: "Le jouet perdu", bubble_en: "The lost toy", bubble_ar: "اللعبة الضائعة" },
          { fr: "{name}, raconte-nous ton endroit secret quand tu étais petit.", en: "{name}, tell us about your secret hiding spot as a child.", ar: "{name}، احكِ لنا عن مكانك السري حين كنت صغيراً.", bubble_fr: "Mon endroit secret", bubble_en: "My secret place", bubble_ar: "مكاني السري" },
          { fr: "{name}, raconte-nous le souvenir le plus fort chez tes grands-parents.", en: "{name}, tell us your strongest memory at your grandparents home.", ar: "{name}، احكِ لنا عن أقوى ذكرياتك في بيت أجدادك.", bubble_fr: "Chez les grands-parents", bubble_en: "At grandmas", bubble_ar: "عند الجدود" },
          { fr: "{name}, raconte-nous la peur d'enfance que tu gardes encore.", en: "{name}, tell us about a childhood fear you still remember.", ar: "{name}، احكِ لنا عن خوف طفولتك الذي لا تزال تتذكره.", bubble_fr: "Ma grande peur", bubble_en: "My biggest fear", bubble_ar: "خوفي الكبير" },
          { fr: "{name}, raconte-nous le cadeau d'enfance qui t'a laissé sans voix.", en: "{name}, tell us about the childhood gift that left you speechless.", ar: "{name}، احكِ لنا عن هدية طفولتك التي أبهرتك.", bubble_fr: "Le cadeau inoubliable", bubble_en: "The unforgettable gift", bubble_ar: "الهدية التي لا تُنسى" }
        ]
      },
      {
        id: "ecole",
        icon: "🏫",
        fr: "École",
        en: "School",
        ar: "المدرسة",
        questions: [
          { fr: "{name}, raconte-nous ton premier jour d'école.", en: "{name}, tell us about your very first day of school.", ar: "{name}، احكِ لنا عن أول يوم لك في المدرسة.", bubble_fr: "Premier jour d'école", bubble_en: "First day of school", bubble_ar: "أول يوم في المدرسة" },
          { fr: "{name}, raconte-nous le professeur qui a changé quelque chose en toi.", en: "{name}, tell us about the teacher who changed something in you.", ar: "{name}، احكِ لنا عن المعلم الذي غيّر شيئاً فيك.", bubble_fr: "Mon prof inoubliable", bubble_en: "My unforgettable teacher", bubble_ar: "معلمي الذي لا أنساه" },
          { fr: "{name}, raconte-nous ta plus grande bêtise à l'école.", en: "{name}, tell us about your biggest mischief at school.", ar: "{name}، احكِ لنا عن أكبر شقاوة فعلتها في المدرسة.", bubble_fr: "Ma grande bêtise", bubble_en: "My biggest prank", bubble_ar: "أكبر شقاوة" },
          { fr: "{name}, raconte-nous le moment où tu t'es senti fier à l'école.", en: "{name}, tell us about your proudest moment at school.", ar: "{name}، احكِ لنا عن لحظة فخرك في المدرسة.", bubble_fr: "Mon moment de fierté", bubble_en: "My proudest moment", bubble_ar: "لحظة فخري" },
          { fr: "{name}, raconte-nous ton meilleur ami d'école.", en: "{name}, tell us about your best friend from school.", ar: "{name}، احكِ لنا عن أعز أصدقائك في المدرسة.", bubble_fr: "Mon meilleur ami", bubble_en: "My school best friend", bubble_ar: "أعز أصدقاء المدرسة" }
        ]
      },
      {
        id: "animaux",
        icon: "🐾",
        fr: "Animaux",
        en: "Pets",
        ar: "الحيوانات الأليفة",
        questions: [
          { fr: "{name}, raconte-nous l'animal qui t'a appris la fidélité sans paroles.", en: "{name}, tell us about the pet that taught you silent loyalty.", ar: "{name}، احكِ لنا عن الحيوان الذي علّمك الوفاء بلا كلام.", bubble_fr: "La fidélité silencieuse", bubble_en: "Silent loyalty", bubble_ar: "الوفاء الصامت" },
          { fr: "{name}, raconte-nous le jour où tu as eu ton premier animal.", en: "{name}, tell us about the day you got your first pet.", ar: "{name}، احكِ لنا عن اليوم الذي حصلت فيه على أول حيوان.", bubble_fr: "Mon premier animal", bubble_en: "My first pet", bubble_ar: "أول حيوان أليف" },
          { fr: "{name}, raconte-nous le souvenir le plus drôle avec un animal.", en: "{name}, tell us your funniest memory with an animal.", ar: "{name}، احكِ لنا عن أطرف ذكرياتك مع حيوان.", bubble_fr: "Mon moment drôle", bubble_en: "My funny moment", bubble_ar: "لحظتي المضحكة" },
          { fr: "{name}, raconte-nous un animal qui te manque encore.", en: "{name}, tell us about a pet you still miss.", ar: "{name}، احكِ لنا عن حيوان لا تزال تفتقده.", bubble_fr: "L'animal qui me manque", bubble_en: "The pet I still miss", bubble_ar: "الحيوان الذي أشتاق إليه" },
          { fr: "{name}, raconte-nous ce qu'un animal t'a appris sur l'amour.", en: "{name}, tell us what an animal taught you about love.", ar: "{name}، احكِ لنا ما علّمك إياه حيوان عن الحب.", bubble_fr: "La leçon d'amour", bubble_en: "Love lesson", bubble_ar: "درس في الحب" }
        ]
      }
    ]
  },
  {
    id: "jeunesse",
    icon: "🌿",
    fr: "Jeunesse",
    en: "Youth",
    ar: "الشباب",
    age_fr: "12 — 25 ans",
    age_en: "12 — 25 years",
    age_ar: "١٢ — ٢٥ سنة",
    tagline_fr: "Quand tout était encore possible",
    tagline_en: "When everything was still possible",
    tagline_ar: "عندما كان كل شيء ممكناً",
    color: "#A8D8A8",
    categories: [
      {
        id: "lycee",
        icon: "🎒",
        fr: "Lycée & Ados",
        en: "High School",
        ar: "سنوات الثانوية",
        questions: [
          { fr: "{name}, raconte-nous ta première sortie sans tes parents.", en: "{name}, tell us about your first outing without your parents.", ar: "{name}، احكِ لنا عن أول خروجك بدون والديك.", bubble_fr: "Ma première liberté", bubble_en: "My first freedom", bubble_ar: "أول حرية" },
          { fr: "{name}, raconte-nous ton premier amour d'adolescent.", en: "{name}, tell us about your first teenage crush.", ar: "{name}، احكِ لنا عن أول حب في مراهقتك.", bubble_fr: "Mon premier amour", bubble_en: "My first love", bubble_ar: "أول حب" },
          { fr: "{name}, raconte-nous le moment où tu t'es senti enfin adulte.", en: "{name}, tell us the moment you first felt like an adult.", ar: "{name}، احكِ لنا عن اللحظة التي شعرت فيها بأنك بالغ.", bubble_fr: "Je me sens adulte", bubble_en: "Feeling grown up", bubble_ar: "شعرت بالنضج" },
          { fr: "{name}, raconte-nous ta plus grande rébellion d'adolescent.", en: "{name}, tell us about your biggest teenage rebellion.", ar: "{name}، احكِ لنا عن أكبر تمرد في مراهقتك.", bubble_fr: "Ma grande rébellion", bubble_en: "My big rebellion", bubble_ar: "تمردي الكبير" },
          { fr: "{name}, raconte-nous le rêve que tu avais pour ton avenir à 16 ans.", en: "{name}, tell us about the dream you had for your future at 16.", ar: "{name}، احكِ لنا عن حلمك لمستقبلك وأنت في السادسة عشرة.", bubble_fr: "Mon rêve à 16 ans", bubble_en: "My dream at 16", bubble_ar: "حلمي في الـ16" }
        ]
      },
      {
        id: "etudes",
        icon: "🎓",
        fr: "Études",
        en: "College Years",
        ar: "سنوات الجامعة",
        questions: [
          { fr: "{name}, raconte-nous le premier jour loin de chez toi.", en: "{name}, tell us about your first day away from home.", ar: "{name}، احكِ لنا عن أول يوم بعيداً عن البيت.", bubble_fr: "Loin de chez moi", bubble_en: "Away from home", bubble_ar: "بعيداً عن البيت" },
          { fr: "{name}, raconte-nous la nuit d'études qui a tout changé.", en: "{name}, tell us about the all-nighter that changed everything.", ar: "{name}، احكِ لنا عن ليلة دراسة غيّرت كل شيء.", bubble_fr: "La nuit qui a tout changé", bubble_en: "The night that changed it all", bubble_ar: "الليلة التي غيّرت كل شيء" },
          { fr: "{name}, raconte-nous l'ami de fac que tu n'oublieras jamais.", en: "{name}, tell us about the college friend you will never forget.", ar: "{name}، احكِ لنا عن صديق الجامعة الذي لن تنساه أبداً.", bubble_fr: "L'ami de fac", bubble_en: "My college friend", bubble_ar: "صديق الجامعة" },
          { fr: "{name}, raconte-nous le moment où tu as choisi ta voie.", en: "{name}, tell us about the moment you chose your path.", ar: "{name}، احكِ لنا عن اللحظة التي اخترت فيها طريقك.", bubble_fr: "Choisir ma voie", bubble_en: "Choosing my path", bubble_ar: "اختيار طريقي" },
          { fr: "{name}, raconte-nous ta plus grande fierté pendant tes études.", en: "{name}, tell us about your greatest achievement during your studies.", ar: "{name}، احكِ لنا عن أكبر إنجازاتك خلال دراستك.", bubble_fr: "Ma fierté d'étudiant", bubble_en: "My student achievement", bubble_ar: "فخر الدراسة" }
        ]
      },
      {
        id: "amis",
        icon: "👥",
        fr: "Amis",
        en: "Friends",
        ar: "الأصدقاء",
        questions: [
          { fr: "{name}, raconte-nous l'ami qui a changé ta vie.", en: "{name}, tell us about the friend who changed your life.", ar: "{name}، احكِ لنا عن الصديق الذي غيّر حياتك.", bubble_fr: "L'ami qui a tout changé", bubble_en: "The friend who changed it all", bubble_ar: "الصديق الذي غيّر كل شيء" },
          { fr: "{name}, raconte-nous le soir où vous avez refait le monde.", en: "{name}, tell us about the night you put the world to rights together.", ar: "{name}، احكِ لنا عن الليلة التي أعدتم فيها تشكيل العالم.", bubble_fr: "Refaire le monde", bubble_en: "Putting the world to rights", bubble_ar: "إعادة تشكيل العالم" },
          { fr: "{name}, raconte-nous ton meilleur souvenir avec un groupe d'amis.", en: "{name}, tell us your best memory with a group of friends.", ar: "{name}، احكِ لنا عن أجمل ذكرياتك مع مجموعة أصدقاء.", bubble_fr: "Notre meilleur souvenir", bubble_en: "Our best memory", bubble_ar: "أجمل ذكرياتنا" },
          { fr: "{name}, raconte-nous un ami que tu as perdu de vue et que tu cherches.", en: "{name}, tell us about a friend you lost touch with and still think about.", ar: "{name}، احكِ لنا عن صديق فقدت تواصله وما زلت تفكر فيه.", bubble_fr: "L'ami perdu de vue", bubble_en: "The lost friend", bubble_ar: "الصديق الضائع" },
          { fr: "{name}, raconte-nous ce que l'amitié t'a appris sur la vie.", en: "{name}, tell us what friendship taught you about life.", ar: "{name}، احكِ لنا ما علّمتك إياه الصداقة عن الحياة.", bubble_fr: "La leçon de l'amitié", bubble_en: "Friendship lesson", bubble_ar: "درس الصداقة" }
        ]
      },
      {
        id: "voyages",
        icon: "✈️",
        fr: "Voyages",
        en: "Travel",
        ar: "السفر",
        questions: [
          { fr: "{name}, raconte-nous le voyage qui a changé quelque chose en toi.", en: "{name}, tell us about the trip that changed something in you.", ar: "{name}، احكِ لنا عن الرحلة التي غيّرت شيئاً فيك.", bubble_fr: "Le voyage transformateur", bubble_en: "The life-changing trip", bubble_ar: "الرحلة التي غيّرتني" },
          { fr: "{name}, raconte-nous la rencontre de voyage qui ne t'a jamais quitté.", en: "{name}, tell us about a travel encounter you never forgot.", ar: "{name}، احكِ لنا عن لقاء في سفر لم تنسه.", bubble_fr: "La rencontre inoubliable", bubble_en: "The unforgettable encounter", bubble_ar: "اللقاء الذي لا يُنسى" },
          { fr: "{name}, raconte-nous le plus beau lever de soleil que tu aies vu.", en: "{name}, tell us about the most beautiful sunrise you ever witnessed.", ar: "{name}، احكِ لنا عن أجمل شروق شمس رأيته.", bubble_fr: "Mon plus beau lever de soleil", bubble_en: "Most beautiful sunrise", bubble_ar: "أجمل شروق شمس" },
          { fr: "{name}, raconte-nous le lieu que tu voudrais revoir une dernière fois.", en: "{name}, tell us about the place you would love to see one last time.", ar: "{name}، احكِ لنا عن المكان الذي تريد رؤيته مرة أخيرة.", bubble_fr: "Le lieu que je veux revoir", bubble_en: "The place I want to revisit", bubble_ar: "المكان الذي أريد رؤيته" },
          { fr: "{name}, raconte-nous ton voyage le plus difficile et ce qu'il t'a appris.", en: "{name}, tell us about your toughest journey and what it taught you.", ar: "{name}، احكِ لنا عن أصعب رحلة وما علّمتك.", bubble_fr: "Mon voyage difficile", bubble_en: "My toughest journey", bubble_ar: "رحلتي الأصعب" }
        ]
      },
      {
        id: "passions",
        icon: "⚽",
        fr: "Passions & Sport",
        en: "Passions & Sport",
        ar: "الشغف والرياضة",
        questions: [
          { fr: "{name}, raconte-nous ce qui te fait perdre la notion du temps.", en: "{name}, tell us about what makes you lose track of time.", ar: "{name}، احكِ لنا عما يجعلك تنسى الوقت.", bubble_fr: "Ce qui m'absorbe", bubble_en: "What absorbs me", bubble_ar: "ما يستغرق وقتي" },
          { fr: "{name}, raconte-nous ton plus grand moment de sport ou de compétition.", en: "{name}, tell us about your greatest sports or competition moment.", ar: "{name}، احكِ لنا عن أعظم لحظة رياضية أو تنافسية.", bubble_fr: "Mon grand moment", bubble_en: "My greatest moment", bubble_ar: "لحظتي العظيمة" },
          { fr: "{name}, raconte-nous comment tu as découvert ta passion.", en: "{name}, tell us how you discovered your passion.", ar: "{name}، احكِ لنا كيف اكتشفت شغفك.", bubble_fr: "Comment j'ai trouvé ma passion", bubble_en: "How I found my passion", bubble_ar: "كيف اكتشفت شغفي" },
          { fr: "{name}, raconte-nous la passion que tu as abandonnée et que tu regrettes.", en: "{name}, tell us about a passion you gave up and still regret.", ar: "{name}، احكِ لنا عن شغف تركته وما زلت تندم عليه.", bubble_fr: "La passion abandonnée", bubble_en: "The passion I gave up", bubble_ar: "الشغف الذي تركته" },
          { fr: "{name}, raconte-nous le match ou la performance dont tu es le plus fier.", en: "{name}, tell us about the match or performance you are most proud of.", ar: "{name}، احكِ لنا عن المباراة أو الأداء الذي تفخر به.", bubble_fr: "Ma meilleure performance", bubble_en: "My best performance", bubble_ar: "أفضل أداء لي" }
        ]
      }
    ]
  },
  {
    id: "adulte",
    icon: "🏠",
    fr: "Vie d'adulte",
    en: "Adulthood",
    ar: "العُمر الذهبي",
    age_fr: "25 — 50 ans",
    age_en: "25 — 50 years",
    age_ar: "٢٥ — ٥٠ سنة",
    tagline_fr: "Ce que tu as construit",
    tagline_en: "What you have built",
    tagline_ar: "كل ما بنيته في حياتك",
    color: "#E8A87C",
    categories: [
      {
        id: "amour",
        icon: "❤️",
        fr: "Amour & Mariage",
        en: "Love & Marriage",
        ar: "الحب والزواج",
        questions: [
          { fr: "{name}, raconte-nous le moment où tu as su que c'était la bonne personne.", en: "{name}, tell us about the moment you knew they were the one.", ar: "{name}، احكِ لنا عن اللحظة التي عرفت فيها أنه الشخص المناسب.", bubble_fr: "Je savais que c'était toi", bubble_en: "I knew it was you", bubble_ar: "عرفت أنك الشخص" },
          { fr: "{name}, raconte-nous le geste de ton partenaire qui t'a le plus touché.", en: "{name}, tell us about your partner's gesture that moved you most.", ar: "{name}، احكِ لنا عن أكثر لفتة من شريكك أثّرت فيك.", bubble_fr: "Le geste qui m'a touché", bubble_en: "The gesture that moved me", bubble_ar: "اللفتة التي أثّرت فيّ" },
          { fr: "{name}, raconte-nous votre souvenir de couple le plus précieux.", en: "{name}, tell us about your most precious couple memory.", ar: "{name}، احكِ لنا عن أثمن ذكرى لكما معاً.", bubble_fr: "Notre plus belle mémoire", bubble_en: "Our most precious memory", bubble_ar: "أثمن ذكرياتنا" },
          { fr: "{name}, raconte-nous ce que l'amour t'a appris sur toi-même.", en: "{name}, tell us what love taught you about yourself.", ar: "{name}، احكِ لنا ما علّمك إياه الحب عن نفسك.", bubble_fr: "Ce que l'amour m'a appris", bubble_en: "What love taught me", bubble_ar: "ما علّمني الحب" },
          { fr: "{name}, raconte-nous la leçon d'amour que tu voudrais transmettre.", en: "{name}, tell us about the love lesson you want to pass on.", ar: "{name}، احكِ لنا عن درس الحب الذي تريد أن تورثه.", bubble_fr: "Ma leçon d'amour", bubble_en: "My love lesson", bubble_ar: "درسي في الحب" }
        ]
      },
      {
        id: "parentalite",
        icon: "👨‍👩‍👧",
        fr: "Parentalité",
        en: "Being a Parent",
        ar: "الأبوة والأمومة",
        questions: [
          { fr: "{name}, raconte-nous le jour où tu es devenu parent.", en: "{name}, tell us about the day you became a parent.", ar: "{name}، احكِ لنا عن اليوم الذي أصبحت فيه أباً أو أماً.", bubble_fr: "Je suis devenu parent", bubble_en: "I became a parent", bubble_ar: "أصبحت أباً أو أماً" },
          { fr: "{name}, raconte-nous le moment avec ton enfant qui t'a fait pleurer de joie.", en: "{name}, tell us about the moment with your child that made you cry with joy.", ar: "{name}، احكِ لنا عن اللحظة مع طفلك التي جعلتك تبكي من الفرح.", bubble_fr: "Les larmes de joie", bubble_en: "Tears of joy", bubble_ar: "دموع الفرح" },
          { fr: "{name}, raconte-nous ce que tes enfants t'ont appris sur la vie.", en: "{name}, tell us what your children taught you about life.", ar: "{name}، احكِ لنا ما علّمك إياه أطفالك عن الحياة.", bubble_fr: "Ce que mes enfants m'ont appris", bubble_en: "What my children taught me", bubble_ar: "ما علّمني أطفالي" },
          { fr: "{name}, raconte-nous la peur que tu avais avant de devenir parent.", en: "{name}, tell us about the fear you had before becoming a parent.", ar: "{name}، احكِ لنا عن الخوف الذي كان لديك قبل أن تصبح أباً أو أماً.", bubble_fr: "Ma peur de devenir parent", bubble_en: "My fear of parenthood", bubble_ar: "خوفي من الأبوة" },
          { fr: "{name}, raconte-nous le conseil que tu donnerais à un nouveau parent.", en: "{name}, tell us the advice you would give to a new parent.", ar: "{name}، احكِ لنا النصيحة التي ستعطيها لأب أو أم جديد.", bubble_fr: "Mon conseil de parent", bubble_en: "My parenting advice", bubble_ar: "نصيحتي للوالدين" }
        ]
      },
      {
        id: "carriere",
        icon: "💼",
        fr: "Carrière",
        en: "Work & Career",
        ar: "العمل والمسيرة",
        questions: [
          { fr: "{name}, raconte-nous le moment de ta carrière dont tu es le plus fier.", en: "{name}, tell us about the career moment you are most proud of.", ar: "{name}، احكِ لنا عن أكثر لحظة في مسيرتك تفخر بها.", bubble_fr: "Ma plus grande fierté pro", bubble_en: "My greatest career pride", bubble_ar: "أكبر فخر مهني" },
          { fr: "{name}, raconte-nous qui a cru en toi avant que tu croies en toi.", en: "{name}, tell us who believed in you before you believed in yourself.", ar: "{name}، احكِ لنا عن من آمن بك قبل أن تؤمن بنفسك.", bubble_fr: "Celui qui a cru en moi", bubble_en: "Who believed in me", bubble_ar: "من آمن بي" },
          { fr: "{name}, raconte-nous l'erreur professionnelle qui t'a le plus appris.", en: "{name}, tell us about the professional mistake that taught you the most.", ar: "{name}، احكِ لنا عن الخطأ المهني الذي علّمك أكثر.", bubble_fr: "L'erreur qui m'a appris", bubble_en: "The mistake that taught me", bubble_ar: "الخطأ الذي علّمني" },
          { fr: "{name}, raconte-nous ce que tu aurais dit à toi-même à 25 ans.", en: "{name}, tell us what you would say to your 25-year-old self.", ar: "{name}، احكِ لنا ما ستقوله لنفسك في سن الخامسة والعشرين.", bubble_fr: "Ce que je dirais à mes 25 ans", bubble_en: "What I'd tell my 25-year-old self", bubble_ar: "ما سأقوله لنفسي في الـ25" },
          { fr: "{name}, raconte-nous le premier salaire que tu as gagné.", en: "{name}, tell us about the first paycheck you ever earned.", ar: "{name}، احكِ لنا عن أول راتب ربحته.", bubble_fr: "Mon premier salaire", bubble_en: "My first paycheck", bubble_ar: "أول راتب" }
        ]
      },
      {
        id: "famille",
        icon: "🤝",
        fr: "Temps en famille",
        en: "Family Time",
        ar: "الوقت العائلي",
        questions: [
          { fr: "{name}, raconte-nous la fête de famille que tu n'oublieras jamais.", en: "{name}, tell us about the family celebration you will never forget.", ar: "{name}، احكِ لنا عن احتفال عائلي لن تنساه أبداً.", bubble_fr: "La fête inoubliable", bubble_en: "The unforgettable celebration", bubble_ar: "الاحتفال الذي لا يُنسى" },
          { fr: "{name}, raconte-nous le repas de famille qui te revient toujours.", en: "{name}, tell us about the family meal that always comes back to you.", ar: "{name}، احكِ لنا عن وجبة عائلية تعود إليك دائماً.", bubble_fr: "Le repas qui me revient", bubble_en: "The meal I always remember", bubble_ar: "الوجبة التي تعود إليّ" },
          { fr: "{name}, raconte-nous la tradition familiale que tu tiens à transmettre.", en: "{name}, tell us about the family tradition you want to pass on.", ar: "{name}، احكِ لنا عن التقليد العائلي الذي تريد توارثه.", bubble_fr: "Notre tradition familiale", bubble_en: "Our family tradition", bubble_ar: "تقليدنا العائلي" },
          { fr: "{name}, raconte-nous le moment où ta famille t'a surpris.", en: "{name}, tell us about the moment your family surprised you.", ar: "{name}، احكِ لنا عن اللحظة التي فاجأتك فيها عائلتك.", bubble_fr: "La surprise de ma famille", bubble_en: "My family surprise", bubble_ar: "مفاجأة عائلتي" },
          { fr: "{name}, raconte-nous ce que ta famille t'a appris sur la vie.", en: "{name}, tell us what your family taught you about life.", ar: "{name}، احكِ لنا ما علّمتك إياه عائلتك عن الحياة.", bubble_fr: "La leçon de ma famille", bubble_en: "My family lesson", bubble_ar: "درس عائلتي" }
        ]
      },
      {
        id: "epreuves",
        icon: "💪",
        fr: "Épreuves",
        en: "Challenges",
        ar: "التحديات",
        questions: [
          { fr: "{name}, raconte-nous l'épreuve qui t'a rendu plus fort.", en: "{name}, tell us about the challenge that made you stronger.", ar: "{name}، احكِ لنا عن التحدي الذي جعلك أقوى.", bubble_fr: "L'épreuve qui m'a forgé", bubble_en: "The challenge that shaped me", bubble_ar: "التحدي الذي صنعني" },
          { fr: "{name}, raconte-nous le moment où tu as voulu abandonner mais tu as continué.", en: "{name}, tell us about the moment you wanted to quit but kept going.", ar: "{name}، احكِ لنا عن اللحظة التي أردت فيها الاستسلام لكنك تابعت.", bubble_fr: "J'ai failli abandonner", bubble_en: "I almost gave up", bubble_ar: "كدت أستسلم" },
          { fr: "{name}, raconte-nous la décision la plus difficile de ta vie.", en: "{name}, tell us about the hardest decision you ever made.", ar: "{name}، احكِ لنا عن أصعب قرار اتخذته في حياتك.", bubble_fr: "Ma décision la plus difficile", bubble_en: "My hardest decision", bubble_ar: "أصعب قراراتي" },
          { fr: "{name}, raconte-nous ce que la difficulté t'a appris sur toi.", en: "{name}, tell us what hardship taught you about yourself.", ar: "{name}، احكِ لنا ما علّمتك الصعوبة عن نفسك.", bubble_fr: "Ce que la difficulté m'a appris", bubble_en: "What hardship taught me", bubble_ar: "ما علّمتني الصعوبة" },
          { fr: "{name}, raconte-nous la personne qui t'a aidé dans ton moment le plus sombre.", en: "{name}, tell us about the person who helped you in your darkest moment.", ar: "{name}، احكِ لنا عن الشخص الذي ساعدك في أصعب لحظاتك.", bubble_fr: "Celui qui m'a sauvé", bubble_en: "Who saved me", bubble_ar: "من أنقذني" }
        ]
      }
    ]
  },
  {
    id: "maturite",
    icon: "🌅",
    fr: "Maturité",
    en: "Legacy",
    ar: "الحكمة",
    age_fr: "50 ans et plus",
    age_en: "50 years and over",
    age_ar: "٥٠ سنة وما فوق",
    tagline_fr: "Ce que tu transmets",
    tagline_en: "What will outlive you",
    tagline_ar: "ما سيبقى بعدك",
    color: "#D4AF37",
    categories: [
      {
        id: "grands_parents",
        icon: "👴",
        fr: "Grands-parents",
        en: "Being a Grandparent",
        ar: "الجد والجدة",
        questions: [
          { fr: "{name}, raconte-nous ce que tes petits-enfants t'ont appris.", en: "{name}, tell us what your grandchildren taught you.", ar: "{name}، احكِ لنا ما علّمك إياه أحفادك.", bubble_fr: "Ce que mes petits-enfants m'ont appris", bubble_en: "What my grandchildren taught me", bubble_ar: "ما علّمني أحفادي" },
          { fr: "{name}, raconte-nous le moment le plus précieux avec un petit-enfant.", en: "{name}, tell us about the most precious moment with a grandchild.", ar: "{name}، احكِ لنا عن أثمن لحظة مع أحد أحفادك.", bubble_fr: "Mon trésor avec mes petits-enfants", bubble_en: "My treasure with grandchildren", bubble_ar: "كنزي مع أحفادي" },
          { fr: "{name}, raconte-nous l'histoire que tu veux absolument leur raconter.", en: "{name}, tell us the story you absolutely want to tell your grandchildren.", ar: "{name}، احكِ لنا القصة التي تريد بالتأكيد أن ترويها لأحفادك.", bubble_fr: "L'histoire que je dois leur raconter", bubble_en: "The story I must tell them", bubble_ar: "القصة التي يجب أن أرويها" },
          { fr: "{name}, raconte-nous ce que tu veux qu'ils retiennent de toi.", en: "{name}, tell us what you want them to remember about you.", ar: "{name}، احكِ لنا ما تريد أن يتذكروه عنك.", bubble_fr: "Ce qu'ils retiendront de moi", bubble_en: "What they will remember", bubble_ar: "ما سيتذكرونه عني" },
          { fr: "{name}, raconte-nous comment tu vois le monde à travers leurs yeux.", en: "{name}, tell us how you see the world through their eyes.", ar: "{name}، احكِ لنا كيف ترى العالم من خلال عيونهم.", bubble_fr: "Le monde à travers leurs yeux", bubble_en: "World through their eyes", bubble_ar: "العالم من خلال عيونهم" }
        ]
      }
    ]
  }
];