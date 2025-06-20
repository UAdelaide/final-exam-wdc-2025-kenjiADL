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
        
    }
  }
})