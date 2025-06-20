const { createApp } = Vue;

createApp({
  data() {
    return {
      title: "DOG OF THE DAY",
      dogImage: ''
    };
  },
  mounted() {
    this.getDog();
  },
  methods: {
    getDog() {
        fetch("https://dog.ceo/api/breeds/image/random")
        .then(res => res.json())
    }
  }
})