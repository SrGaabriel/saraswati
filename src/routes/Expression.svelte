<script>
    let text = 'T';
</script>

<div class="expression">
    <span class="color"></span>
    <input
        class="text"
        bind:value={text}
        placeholder="Type an expression"
    />
</div>

<style>
    .expression {
        display: flex;
        align-items: center;
        width: 100%;
        height: 50px;
        padding: 0 16px;
        border-bottom: 1px solid rgb(204, 204, 204);
    }
    .color {
        height: 24px;
        aspect-ratio: 1/1;
        background-color: rgb(116, 201, 116);
        border-radius: 100%;
        border: 1px solid rgb(158, 158, 158);
    }
    .text {
        display: flex;
        align-items: center;
        background-color: transparent;
        outline: none;
        border: none;
        font-family: 'Roboto', sans-serif;
        font-size: 1.0rem;
        margin-left: 1rem;
        padding-left: 1rem;
        border-left: 1px solid rgb(204, 204, 204);
        height: 100%;
    }
</style>